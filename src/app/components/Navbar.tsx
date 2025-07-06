"use client";

import { Bars3Icon, MoonIcon, SunIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react'
import Link from 'next/link';
import { usePathname } from 'next/navigation';


const Navbar = () => {
  const theme = "dark"; // This can be dynamically set based on user preference
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
    const pathName = usePathname();
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    }

    const menuItems = [
        { label: 'Home', href: '/' },
        { label: 'Projects', href: '/projects' },
        { label: 'About', href: '/about' },
        { label: 'Blogs', href: '/blogs' },
        { label: 'Contact', href: '/contact' },
    ];

  return (
    <nav className="fixed w-full bg-dark/80 backdrop-blur-sm z-50">
        <div className="container max-w-7xl mx-auto px-4">
          {/* Desktop Menu */}
          <div className='flex items-center justify-between h-16'>
            <Link href="/" className="text-xl font-bold text-primary">Devfolio&trade;</Link>
            
            {/* Desktop Menu*/}
            <div className='hidden md:flex items-center space-x-8'>
              {
              menuItems.map((item) =>{
                const isActive = pathName === item.href;
                return(
                  <Link key={item.href} href={item.href} className={`hover:text-primary transition-colors font-medium ${isActive ? 'text-primary' : ''}`}>{item.label}</Link>
                )
              })
            }
            <button className='p-2 rounded-full hover:bg-gray-100 text-primary dark:hover:bg-gray-800 transition-colors'>
              {
                theme === "dark" ? (
                  <SunIcon className='w-5 h-5'/>
                ) : (
                  <MoonIcon className='w-5 h-5'/>
                )
              }
            </button>
            </div> 

            {/* Mobile Menu Button*/}          
            <button 
              onClick={toggleMobileMenu} 
              className='md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor pointer'>
                {
                  isMobileMenuOpen ? (<XMarkIcon className='w-5 h5'/>) : (<Bars3Icon className='w-5 h5'/>)
                }
            </button>
          </div>
          
          {/* Mobile Menu */}
          { 
            isMobileMenuOpen && (
              <div className= 'md:hidden'>
                <div className='py-4 space-y-2'>
                  {
                      menuItems.map((item, index) => (
                        <div key={index} onClick={toggleMobileMenu}>
                          <Link href={item.href} className='block py-2 hover:text-primary transition-colors'>{item.label}</Link>
                        </div>
                      ))
                  }
                  <div>
                    <button className='flex items-center py-2 hover:text-primary transition-colors'>
                    {
                      theme === "dark" ? (
                        <><SunIcon className='w-5 h-5 mr-2'/> Light Mode</>
                      ) : (
                        <><MoonIcon className='w-5 h-5 mr-2'/> Dark Mode</>
                      )
                    }
                  </button>

                  </div>
                </div>
              </div>
            )
          }
        </div>
    </nav>
  )
}

export default Navbar