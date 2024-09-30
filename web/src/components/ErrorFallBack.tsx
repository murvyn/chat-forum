import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import server from "@/assets/server-down.png";
import { useNavigate } from "react-router-dom";

interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<FallbackProps> = ({ error }) => {
  const { logout } = useAuth();
  const router = useNavigate();

  return (
    <div className="flex fixed top-0 left-0 bg-white z-50 bg-opacity-80 w-full h-screen flex-col justify-center items-center">
      <img src={server} alt="" />
      <p className="text-center text-xl font-semibold ">Something went wrong</p>
      <p className="text-center text-sm mb-5">{error.message}</p>
      <div className="">
        <Button variant={"outline"} onClick={logout} className="rounded-none">
          Logout
        </Button>
        <Button onClick={() => router(0)} className="rounded-none">
          Reload
        </Button>
      </div>
    </div>
  );
};

export default ErrorFallback;
