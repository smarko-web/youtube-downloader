import { useState } from 'react'
import { Header, Form, VideoPrev, Sidebar } from './components';
import './App.css'
import { createContext } from 'react';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import { AudioConverter, Layout, VideoConverter } from './pages';
// export const MyContext = createContext();


const router = new createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'video',
        element: <VideoConverter/>,
        index: true,
      },
      {
        path: 'audio',
        element: <AudioConverter/>,
      },
    ],
    errorElement: <h1>404</h1>,
  },
]);
function App() {

  return (
    <RouterProvider router={router}>
    </RouterProvider>
  )
  return (
    <MyContext.Provider value={{url, setUrl}}>
      <Header />
      <main>
        <Form type="video" />
        <VideoPrev />
      </main>
      {/* <Sidebar /> */}
    </MyContext.Provider>
  );
}

export default App
