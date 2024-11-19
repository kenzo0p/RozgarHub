import React from 'react'
import Navbar from './shared/Navbar'
import HeroSection from './HeroSection'
import CategoryCaraousal from './CategoryCaraousal'
import LatestJobs from './LatestJobs'
import Footer from './Footer'

function Home() {
  return (
    <div>
        <Navbar/>
        <HeroSection/>
        <CategoryCaraousal/>
        <LatestJobs/>
        <Footer/>

    </div>
  )
}

export default Home