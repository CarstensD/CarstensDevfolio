"use client";

import { FaEnvelope, FaMapMarkedAlt, FaPhoneAlt } from "react-icons/fa";
import Input from "../components/input";
import { Textarea } from "flowbite-react";

const info = [
    {
        icon: <FaPhoneAlt />,
        title: "Phone",
        details: "+27 71 617 2619",
    },
    {
        icon: <FaEnvelope />,
        title: "Email",
        details: "davincarstens@gmail.com",
    },
    {
        icon: <FaMapMarkedAlt />,
        title: "Location",
        details: "9 Hopkins st, Salt River, Cape Town, South Africa",
    }
];



const ContactPage = () => {
    return (
        <div className="container mx-auto">
            <div className="flex flex-col xl:flex-row gap-[30px]">
                {/*Form*/}
                    <div className="xl:w-[54%] order-2 xl:order-none">
                        <form className="flex flex-col gap-6 p-10 bg-[#27272c] rounded-xl">
                            <h3 className="text-4xl text-accent">Let's work together</h3>
                            <p className="text-white/60">Feel free to reach out to me by filling the form below</p>
                            {/*Input*/}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input label="First Name" type="firstName" placeholder="First Name" />
                                <Input label="Last Name" type="lastName" placeholder="Last Name" />
                                <Input label="Email Address" type="email" placeholder="Email Address" />
                                <Input label="Phone Number" type="phone" placeholder="Phone Number" required />
                            </div>
                            <Textarea
                            className="h-[200px]"
                            placeholder="Type your message here."
                            />
                            <button className="btn btn-lg btn-accent self-start">Send Message</button>
                        </form>
                    </div>
                {/*Info*/}
                <div className="flex-1 flex items-center xl:justify-end order-1 xl:order-none mb-8 xl:mb-0">
                    <ul>
                    {info.map((item, index) => (
                        <li key={index} className="flex items-center gap-4 mb-8">
                            <div className="text-3xl text-accent">{item.icon}</div>
                            <div>
                                <h4 className="text-xl text-white">{item.title}</h4>
                                <p className="text-white/60">{item.details}</p>
                            </div>
                        </li>
                    ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default ContactPage;