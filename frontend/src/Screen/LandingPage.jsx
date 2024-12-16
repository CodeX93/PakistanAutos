// // import React from 'react';
// // import { motion } from 'framer-motion';
// // import { styled } from '@mui/system';
// // import { Container, Fab, Typography } from '@mui/material';
// // import ArrowForwardIcon from "@mui/icons-material/ArrowForward"

// // import CompanyImage from "../Asset/Images/PakistanAutoLogo.jpeg";
// // import { useNavigate } from 'react-router-dom';

// // const FullPageContainer = styled('div')({
// //   display: 'flex',
// //   flexDirection: 'column',
// //   alignItems: 'center',
// //   justifyContent: 'space-between',
// //   height: '100vh',
// //   width: '100%',
// //   position: 'relative',
// //   overflow: 'hidden',
// //   backgroundColor: '#000',
// //   color: '#fff',
// // });

// // const BackgroundImage = styled(motion.div)({
// //   position: 'absolute',
// //   top: 0,
// //   left: 0,
// //   right: 0,
// //   bottom: 0,
// //   backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.3)), url("/api/placeholder/1920/1080")',
// //   backgroundSize: 'cover',
// //   backgroundPosition: 'center',
// // });

// // const ContentContainer = styled(Container)({
// //   display: 'flex',
// //   flexDirection: 'column',
// //   alignItems: 'center',
// //   justifyContent: 'center',
// //   height: '100%',
// //   position: 'relative',
// //   zIndex: 1,
// //   textAlign: 'center',
// // });

// // const Logo = styled(motion.img)({
// //   width: '100%',
// //   height: 'auto',
// //   marginBottom: '2rem',
// //   maxWidth: '500px',
// // });

// // const Title = styled(motion(Typography))({
// //   fontSize: 'clamp(2rem, 5vw, 4rem)',
// //   fontWeight: 'bold',
// //   marginBottom: '1rem',
// //   textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
// // });

// // const Subtitle = styled(motion(Typography))({
// //   fontSize: 'clamp(1rem, 3vw, 1.5rem)',
// //   marginBottom: '2rem',
// //   color: '#FFD700',
// // });

// // const FloatingButton = styled(motion(Fab))({
// //   position: 'absolute',
// //   bottom: '10px',
// //   right: '20px',
// //   left: '50%', // Center horizontally
// //   transform: 'translateX(-50%)',
// //   backgroundColor: '#FFD700',
// //   color: '#000',
// //   '&:hover': {
// //     backgroundColor: '#FFC700',
// //   },
// // });



// // const LandingPage = () => {

// //     const Navigate=useNavigate()
// //   const handleStartClick = () => {
// //     console.log("Let's Roll button clicked");
// //     Navigate('/login')
// //   };

// //   const handleScrollClick = () => {
// //     window.scrollTo({
// //       top: window.innerHeight,
// //       behavior: 'smooth'
// //     });
// //   };

// //   return (
// //     <FullPageContainer>
// //       <BackgroundImage
// //         initial={{ opacity: 0 }}
// //         animate={{ opacity: 1 }}
// //         transition={{ duration: 1.5 }}
// //       />
// //       <ContentContainer>
// //         <Logo
// //           src={CompanyImage}
// //           alt="Pakistan Auto Logo"
// //           initial={{ opacity: 0, y: -50 }}
// //           animate={{ opacity: 1, y: 0 }}
// //           transition={{ duration: 0.8 }}
// //         />
// //         <Title
// //           variant="h1"
// //           initial={{ opacity: 0 }}
// //           animate={{ opacity: 1 }}
// //           transition={{ delay: 0.5, duration: 0.8 }}
// //         >
// //           Welcome to Pakistan Auto
// //         </Title>
// //         <Subtitle
// //           variant="h2"
// //           initial={{ opacity: 0 }}
// //           animate={{ opacity: 1 }}
// //           transition={{ delay: 0.8, duration: 0.8 }}
// //         >
// //           Driving Excellence Since 1986
// //         </Subtitle>
// //       </ContentContainer>
// //       <FloatingButton
// //         onClick={handleStartClick}
// //         initial={{ scale: 1 }}
// //         animate={{ scale: 1 }}
// //         whileHover={{ scale: 1.1 }}
// //         whileTap={{ scale: 0.9 }}
// //         transition={{ type: 'spring', stiffness: 300 }}
// //       >
// //         <ArrowForwardIcon />
// //       </FloatingButton>
     
// //     </FullPageContainer>
// //   );
// // };

// // export default LandingPage;


import React from 'react';
import { motion } from 'framer-motion';
import { styled } from '@mui/system';
import { Container, Fab, Typography } from '@mui/material';
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CompanyImage from "../Asset/Images/PakistanAutoLogo.jpeg";
import { useNavigate } from 'react-router-dom';

const FullPageContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '100vh',
  width: '100%',
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: '#ffffff',
  color: '#333333',
});

const BackgroundImage = styled(motion.div)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.3)), url("/api/placeholder/1920/1080")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
});

const ContentContainer = styled(Container)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  position: 'relative',
  zIndex: 1,
  textAlign: 'center',
});

const Logo = styled(motion.img)({
  width: '100%',
  height: 'auto',
  marginBottom: '2rem',
  maxWidth: '500px',
});

const Title = styled(motion(Typography))({
  fontSize: 'clamp(2rem, 5vw, 4rem)',
  fontWeight: 'bold',
  marginBottom: '1rem',
  textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
  color: '#2c3e50',
});

const Subtitle = styled(motion(Typography))({
  fontSize: 'clamp(1rem, 3vw, 1.5rem)',
  marginBottom: '2rem',
  color: '#10300c',
});

const FloatingButton = styled(motion(Fab))({
  position: 'absolute',
  bottom: '10px',
  right: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: '#10300c',
  color: '#ffffff',
  '&:hover': {
    backgroundColor: '#ba8f00',
  },
});

const LandingPage = () => {
  const Navigate = useNavigate();
  
  const handleStartClick = () => {
    console.log("Let's Roll button clicked");
    Navigate('/login');
  };

  const handleScrollClick = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <FullPageContainer>
      <BackgroundImage
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      />
      <ContentContainer>
        <Logo
          src={CompanyImage}
          alt="Pakistan Auto Logo"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        />
        <Title
          variant="h1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Welcome to Pakistan Auto
        </Title>
        <Subtitle
          variant="h2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          Driving Excellence Since 1986
        </Subtitle>
      </ContentContainer>
      <FloatingButton
        onClick={handleStartClick}
        initial={{ scale: 1 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <ArrowForwardIcon />
      </FloatingButton>
    </FullPageContainer>
  );
};



export default LandingPage;
