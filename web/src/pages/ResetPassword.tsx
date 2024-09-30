import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { z, ZodType } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import UenrLogo from "../assets/uenrLogo.svg";
import { baseUrl, getRequest, postRequest } from "@/utils/services";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/spinner";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  password: string;
  confirmPassword: string;
}

const ResetPassword = () => {
  const { toast } = useToast();
  const { id, token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const {token: authToken} = useAuth()
  const schema: ZodType<Props> = z
    .object({
      password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long" })
        .regex(/^(?=.*[a-z])/, {
          message: "Password must contain at least one lowercase letter",
        })
        .regex(/^(?=.*[A-Z])/, {
          message: "Password must contain at least one uppercase letter",
        })
        .regex(/^(?=.*[0-9])/, {
          message: "Password must contain at least one number",
        })
        .regex(/^(?=.*[!@#$%^&*])/, {
          message:
            "Password must contain at least one special character (!@#$%^&*)",
        })
        .nonempty({ message: "Password is required" }),
      confirmPassword: z
        .string()
        .nonempty({ message: "Confirm password is required" }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Props>({ resolver: zodResolver(schema) });

  useEffect(() => {
    const validateToken = async () => {
        if(!id || !token){
            navigate("/auth/sign-in");
            return
        }
      try {
        const response = await getRequest(
          `${baseUrl}/auth/reset-password/${id}/${token}`, authToken
        );
        console.log(response)
        if (response.error) {
          toast({
            description: response.message,
            variant: response.error && "destructive",
          });
          navigate("/auth/sign-in");
        } else {
          setLoading(false);
        }
      } catch (error) {
        toast({
          description: (error as Error).message,
          variant: "destructive",
        });
        navigate("/auth/sign-in");
      }
    };
    validateToken();
  }, [id, token, toast, navigate]);

  const onSubmit: SubmitHandler<Props> = async (data) => {
    try {
      setLoading(true)
      const response = await postRequest(
        `${baseUrl}/auth/reset-password/${id}/${token}`,
        authToken,
        JSON.stringify({password: data.password})
      );
      if (response.error) {
        toast({
          description: response.message,
          variant: response.error && "destructive",
        });
        return;
      }else{
        toast({
          description: response.message,
          color: "green",
          duration: 2000,
          style: { color: "green" },
        });
        navigate("/auth/sign-in");
      }
    } catch {
      toast({
        description: "An error occurred while resetting the password",
        variant: "destructive",
      });
      return;
    }finally{
      setLoading(false)
    }
  };
  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <img
            className="mx-auto h-12 w-auto"
            src={UenrLogo}
            alt="University Chat Forum"
          />
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your new password to reset your account.
          </p>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 space-y-6"
          action="#"
          method="POST"
        >
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <Label htmlFor="password" className="sr-only">
                New Password
              </Label>
              <Input
                {...register("password")}
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full appearance-none rounded-t-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                placeholder="New Password"
              />
              {errors.password && (
                <span className="text-red-500 text-sm">
                  {errors.password.message}
                </span>
              )}
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </Label>
              <Input
                {...register("confirmPassword")}
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="relative block w-full appearance-none rounded-b-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                placeholder="Confirm Password"
              />
              {errors.confirmPassword && (
                <span className="text-red-500 text-sm">
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>
          </div>
          <div>
            <Button type="submit" className="w-full">
            {loading ? <Spinner className="text-white" /> : "Reset Password"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
