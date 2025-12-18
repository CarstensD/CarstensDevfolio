"use client";

import { TextInput } from "flowbite-react";

type InputProps = {
    label: string;
    placeholder: string;
    type?: string;
    required?: boolean;
}

const Input = ({ label, placeholder, type = "text", required = false }: InputProps) => {
    return (
        <div>
            { label && (
                <label className="block mb-2 text-sm font-medium text-heading">
                    {label}
                </label>
            )}
            <input 
              type={type} 
              className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-2.5 py-2 shadow-xs placeholder:text-body" 
              placeholder={placeholder} 
              required={required} 
            />
        </div>
    )
}

export default Input;