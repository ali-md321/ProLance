import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from "react-redux";
import "./App.css";
import 'react-toastify/dist/ReactToastify.css';

import { ToastContainer } from 'react-toastify';
import { Route, Routes } from "react-router-dom";
import { loadUserAction } from './actions/userAction';
import Navbar from './components/layout/Navbar';
import SpinLoader from './components/layout/SpinLoader';
import HomePage from './components/HomePage';
import Signup from './components/auth/Signup';
import Login from './components/auth/Login';
import Profile from './components/profile/Profile';
import EditUser from './components/profile/EditUser';
import ClientDashboardLayout from './components/Client/ClientDashboardLayout';
import CreateProject from './components/Client/CreateProject';
import MyProjects from './components/Client/MyProjects';
import ProjectInfo from './components/Pages/ProjectInfo';
import EditProject from './components/Client/EditProject';
import Dashboard from './components/FreeLancer/Dashboard';
import BrowseProjects from './components/FreeLancer/BrowseProjects';
import MyProposals from './components/FreeLancer/MyProposals';
import { ActiveProjects, CompletedProjects } from './components/FreeLancer/ProjectStatus';
import FreelancerProjectDetails from './components/FreeLancer/FreelancerProjectDetails';
import FreelancerDashboardLayout from './components/FreeLancer/FreelancerDashboardLayout';
import ProjectProposals from './components/Client/ProjectProposals';
import AllProposals from './components/Client/AllProposals';

function App() {
  const [appLoading, setAppLoading] = useState(true); 
  const { isAuthenticated, isLoading, user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  
  useEffect(() => {
    async function loadUser() {
      await dispatch(loadUserAction());
      setAppLoading(false); 
    }
    loadUser();
  }, [dispatch]);

  if (appLoading) {
    return <SpinLoader />;
  }

  return (
    <>
      <Navbar />
      <ToastContainer position="bottom-right" autoClose={3000} />
      <div className="pt-16">
        <Routes>
          {isAuthenticated ?
          <>
            
            {user?.role === "client" ? 
              <Route path="/" element={<ClientDashboardLayout />}>
                <Route path="dashboard" element={<p className='text-white'>ClientHome</p>} />
                <Route path="create-project" element={<CreateProject />} />
                <Route path='profile/:id' element={<Profile />}/>
                <Route path="projects" element={<MyProjects />} />
                <Route path="projects/:id" element={<ProjectInfo />} />
                <Route path="projects/:id/proposals" element={<ProjectProposals />} />
                <Route path='proposals/all' element={<AllProposals />} />
                <Route path="edit-project/:id" element={<EditProject />} />
                <Route path="completed" element={<p className='text-white'>Completed Projects</p>} />
                <Route path="client-projects" element={<p className='text-white'>ClientProjects</p>} />
              </Route>
            :
              <Route path="/freelancer" element={<FreelancerDashboardLayout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="browse-projects" element={<BrowseProjects />} />
                <Route path='projects/:id' element={<FreelancerProjectDetails />} />
                <Route path="my-proposals" element={<MyProposals />} />
                <Route path="active-projects" element={<ActiveProjects />} />
                <Route path="completed-projects" element={<CompletedProjects />} />
                <Route path="profile/:id" element={<Profile />} />
              </Route>
            }
            <Route path='/profile/:id' element={<Profile />}/>
            <Route path='/edit-user' element={<EditUser />}/>
            <Route path='/' element={<HomePage />}/>
          </>
          :
          <>
            <Route path='/login' element={<Login />} />
            <Route path='/signup' element={<Signup />} />
          </>
          }
          <Route path="*" element={<HomePage />}/>
        </Routes>
      </div>
    </>
  )
}

export default App
