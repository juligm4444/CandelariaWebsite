import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const Register = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Here you would typically send the data to your backend
  };

  return (
    <>
      {/* Sponsorship Section */}
      <div className="flex flex-col gap-[30px] items-center justify-center overflow-hidden px-0 py-[60px] relative w-full">
        <div className="h-[270px] overflow-hidden relative w-full">
          <div className="absolute h-[250px] left-[212.5px] top-[10px] w-[738px] bg-gray-200 border border-gray-400">
            {/* Sponsorship image placeholder */}
          </div>
          <p className="absolute font-normal text-[25px] text-black text-justify top-[30px] right-[210px] w-[736px]">
            At the moment, Candelaria project has only being sponsored by the Universidad de los Andes and the effort of it's members. But if you are interested in sponsor or support the project with any help, we will be forever thankful with you. By clicking the following button, you will be redirected to a payment gateway where you can voluntarily give a monetary apport to the project:
          </p>
        </div>
        <div className="h-[60px] relative w-full">
          <div className="absolute bg-white border border-black flex flex-col items-center justify-center right-[446px] px-[18px] py-[15px] rounded-[10px] top-0">
            <p className="font-normal text-[25px] text-black text-center whitespace-nowrap">
              Support Us
            </p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="flex flex-col gap-[30px] items-center justify-center overflow-hidden px-0 py-[60px] relative w-full">
        <p className="font-bold text-[30px] text-black text-center whitespace-nowrap">
          Contact Us
        </p>
        
        <div className="flex items-center justify-between overflow-hidden px-[211px] py-[25px] relative w-full">
          <div className="h-[292px] relative w-[736px]">
            <p className="absolute font-normal text-[25px] text-black text-justify top-0 w-[736px]">
              If you are interested in the project or want to know more about it, feel free to contact us. Also, you can check our social media accounts where we post the most important information about the project.
            </p>
            <div className="absolute h-[47px] left-[156px] top-[245px] w-[434px] bg-gray-300 border border-gray-400 rounded flex items-center justify-center gap-4">
              {/* Social media icons placeholder */}
              <div className="w-8 h-8 bg-gray-500 rounded"></div>
              <div className="w-8 h-8 bg-gray-500 rounded"></div>
              <div className="w-8 h-8 bg-gray-500 rounded"></div>
            </div>
          </div>
          
          <form 
            onSubmit={handleSubmit}
            className="flex flex-col gap-[10px] items-start overflow-hidden px-[50px] py-[32px] relative w-[737px]"
          >
            <label className="font-normal text-[25px] text-black whitespace-nowrap">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your name"
              className="border border-black flex items-center px-[25px] py-[10px] w-full font-normal text-[25px] text-black"
              required
            />
            
            <label className="font-normal text-[25px] text-black whitespace-nowrap">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter a valid email address"
              className="border border-black flex items-center px-[25px] py-[10px] w-full font-normal text-[25px] text-black"
              required
            />
            
            <label className="font-normal text-[25px] text-black whitespace-nowrap">
              Message
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Enter your message"
              className="border border-black h-[250px] items-start px-[25px] py-[10px] w-full font-normal text-[25px] text-black resize-none"
              required
            />
          </form>
        </div>
        
        <div className="h-[60px] relative w-full">
          <button
            onClick={handleSubmit}
            className="absolute bg-white border border-black flex flex-col items-center justify-center right-[416px] px-[18px] py-[15px] rounded-[10px] top-0"
          >
            <p className="font-normal text-[25px] text-black text-center whitespace-nowrap">
              Send
            </p>
          </button>
        </div>
      </div>
    </>
  );
};
