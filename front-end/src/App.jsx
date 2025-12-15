import './App.css'
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import { AudioConverter, Home, Layout, VideoConverter } from './pages';

const router = new createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <Home />,
        index: true,
      },
      {
        path: 'video',
        element: <VideoConverter />,
      },
      {
        path: 'audio',
        element: <AudioConverter />,
      },
    ],
    errorElement: <h1>404</h1>,
  },
]);
function App() {
  return (
    <RouterProvider router={router}>
    </RouterProvider>
  );
}
export default App;
