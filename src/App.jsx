import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {ComponentsTrial} from './Components/ComponentsTrial'
import { FoodCards } from './Components/Cards'
import { CartDemo } from './Components/Cart'
import { ProfileDemo } from './Components/ProfileComponent'
import { FeaturedFoodsDemo } from './Components/FeaturedSlide'
import { Navbar } from './Components/Navbar'

function App() {
  //const [count, setCount] = useState(0)

  return (
    <>
    <Navbar/>
    <ProfileDemo/>
     <ComponentsTrial/>
     <FoodCards/>
     <CartDemo/>
     <FeaturedFoodsDemo/>
    </>
  )
}

export default App
