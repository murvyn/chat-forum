import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";

const EmailSuccess = () => {
  const navigate = useNavigate();
  return (
    <div>
      <div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
          Email sent!
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          We've sent you a link to reset your password. Please check your email.
        </p>
      </div>
      <div className="my-6 w-full flex justify-center text-6xl text-green-500">
        <FaCheckCircle />
      </div>
      <div>
        <Button
          onClick={() => navigate("/auth/sign-in")}
          type="submit"
          className="w-full"
        >
          Return to sign in
        </Button>
      </div>
    </div>
  );
};

export default EmailSuccess;
