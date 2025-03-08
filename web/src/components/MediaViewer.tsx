import { motion } from "framer-motion";
import { FiDownload, FiX } from "react-icons/fi";

const MediaViewer = ({
  message,
  onClose,
}: {
  message: {url: string, type: "image" | "video"};
  onClose: () => void;
  
}) => {
  if (!message.url) return null;

  const handleDownload = async () => {
    try {
      const response = await fetch(message.url, { mode: "cors" }); 
      const blob = await response.blob(); 
      const objectUrl = URL.createObjectURL(blob); 

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `media_${Date.now()}.${message.type === "image" ? "jpg" : "mp4"}`; 
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Error downloading the image:", error);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex justify-center items-center z-50"
      onClick={onClose} 
    >
      <button
        className="absolute top-2 right-2 text-white p-2 rounded-full hover:bg-gray-700"
        onClick={onClose}
      >
        <FiX size={24} />
      </button>
      {message.type === "image" ? (
        <motion.img
          src={message.url}
          alt="Image message"
          className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={(e) => e.stopPropagation()} 
        />
      ) : 
      (
        <motion.video
          src={message.url}
          controls
          className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={(e) => e.stopPropagation()}
        />
      )
      }
      <div className="absolute right-0 bottom-0 px-4 py-2 ">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDownload();
          }}
          className="text-2xl text-gray-300 rounded-full p-2 hover:bg-gray-700"
        >
          <FiDownload />
        </button>
      </div>
    </div>
  );
};

export default MediaViewer;
