import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Spin } from 'antd';
import { Post } from '../../types/post';
import styles from './PostPage.module.css';

const PostPage = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const page = searchParams.get('page') || '1';

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${Number(id)}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error(`Ошибка ${res.status}`);
        }
        const data: Post = await res.json();
        setPost(data);
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') return;
        console.error('Ошибка загрузки поста:', e);
        setError('Не удалось загрузить пост.');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    fetchPost();
    return () => {
      controller.abort();
    };
  }, [id]);

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <Spin size="large" />
      </div>
    );
  }

  if (!post) {
    return <div className={styles.notFound}>Пост не найден</div>;
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Alert title="Ошибка загрузки" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button onClick={() => navigate(`/?page=${page}`)} className={styles.backButton}>
        Назад к списку
      </button>
      <article className={styles.postCard}>
        <h1 className={styles.postTitle}>{post.title}</h1>
        <div className={styles.postMeta}>
          <span className={styles.postId}>ID: {post.id}</span>
          <span className={styles.postId}>User ID: {post.userId}</span>
        </div>
        <p className={styles.postBody}>{post.body}</p>
      </article>
    </div>
  );
};

export default PostPage;
