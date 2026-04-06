import logo from './logo.svg';
import './App.css';

import Page1 from './Component/Page1';
import { Route,Routes } from 'react-router-dom';
import Layout from './Layout/Layout';
import Contact from './Component/Contact';
import Newsfeed from './Component/Newsfeed';
import Timelineabout from './Component/Timelineabout';


function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<Page1 />} />
          <Route path='contact' element={<Contact />} />
         <Route path="newsfeed" element={<Newsfeed/>}></Route>
         <Route path="timelineabout" element={<Timelineabout/>}></Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
