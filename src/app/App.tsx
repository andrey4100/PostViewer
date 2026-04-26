import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PostList from '../components/PostList/PostList.tsx';
import PostPage from '../pages/PostPage/PostPage.tsx';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PostList />} />
        <Route path="/post/:id" element={<PostPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
