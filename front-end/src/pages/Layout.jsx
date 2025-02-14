import React, {useState} from 'react';
import {Outlet} from 'react-router-dom';
import {Header} from '../components';
import { ToastContainer, toast } from 'react-toastify';
const Layout = () => {
  const [url, setUrl] = useState(''); 
  const [videoId, setVideoId] = useState('');

  // const validateYoutubeUrl = (url) => {
  //   if (!url) {
  //     return toast.error('please enter a link');
  //   }

  //   var regExp = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;

  //   if (!url.match(regExp)) {
  //     return toast.error('url must be a youtube video');
  //   }
  //   // toast.success('video fetched');
  //   setUrl(url);
  
  //   // setVideoId(url.match(regExp)[1]);
  // };

  const handleType = (e) => {
    if (e.target.value === '') {
      setVideoId('');
      setUrl('');
    }
    var regExp =
      /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    if (e.target.value.match(regExp)) {
      setVideoId(e.target.value.match(regExp)[1]);
      setUrl(e.target.value);
    } else {
      setUrl(e.target.value);
    }
  }
  
  return (
    <>
      <ToastContainer position="top-center" autoClose="3000" />
      <Header />
      <main>
        <Outlet context={{ url,setUrl, videoId, setVideoId, handleType }} />
      </main>
    </>
  );
}

export default Layout;