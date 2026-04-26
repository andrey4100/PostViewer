import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert, Pagination, Spin } from 'antd';
import { Post } from '../../types/post';
import styles from './PostList.module.css';

const POSTS_PER_PAGE = 10;

const PostList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);

  const currentPage = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    const controller = new AbortController();
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `https://jsonplaceholder.typicode.com/posts?_limit=${POSTS_PER_PAGE}&_page=${currentPage}`,
          { signal: controller.signal },
        );
        if (!res.ok) {
          throw new Error(`Ошибка ${res.status}`);
        }
        const totalCount = res.headers.get('x-total-count');
        if (totalCount) {
          setTotal(Number(totalCount));
        }
        const data: Post[] = await res.json();
        setPosts(data);
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') return;
        console.error('Ошибка загрузки постов:', e);
        setError('Не удалось загрузить посты. Попробуйте позже.');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    fetchPosts();
    return () => {
      controller.abort();
    };
  }, [currentPage]);

  const handlePageChange = useCallback(
    (page: number) => {
      setSearchParams({ page: String(page) });
    },
    [setSearchParams],
  );

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <Spin size="large" />
      </div>
    );
  }
  if (error) {
    return (
      <div className={styles.loadingWrapper}>
        <Alert title="Ошибка загрузки" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Посты (Страница {currentPage})</h1>
      {posts.length === 0 ? (
        <div className={styles.emptyState}>Нет постов для отображения</div>
      ) : (
        posts.map((post) => (
          <article key={post.id} className={styles.postCard}>
            <h3 className={styles.postTitle}>{post.title}</h3>
            <p className={styles.postBody}>{post.body}...</p>
            <Link to={`/post/${post.id}?page=${currentPage}`} className={styles.readMore}>
              Читать далее
            </Link>
          </article>
        ))
      )}
      <div className={styles.paginationWrapper}>
        <Pagination
          current={currentPage}
          total={total}
          pageSize={POSTS_PER_PAGE}
          onChange={handlePageChange}
          showSizeChanger={false}
        />
      </div>
    </div>
  );
};

export default PostList;
