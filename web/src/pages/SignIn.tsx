import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import UenrLogo from "../assets/uenrLogo.svg";
import { z, ZodType } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginProps } from "@/types";
import { baseUrl } from "@/utils/services";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/spinner";
import { useState } from "react";

const SignIn = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const schema: ZodType<LoginProps> = z.object({
    indexNumber: z
      .string()
      .length(10, {
        message: "Index number must be exactly 10 characters long",
      })
      .nonempty({ message: "Index number is required" }),
    password: z
      .string()
      .min(8)
      .max(255)
      .nonempty({ message: "Password is required" }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginProps>({ resolver: zodResolver(schema) });

  const onSubmit: SubmitHandler<LoginProps> = async (data) => {
    try {
      setLoading(true);
      const response = await login(
        `${baseUrl}/auth/login`,
        JSON.stringify(data)
      );
      if (response.error) {
        toast({
          description: response.message,
          variant: response.error && "destructive",
        });
        return;
      }
      toast({
        description: response.message,
        color: "green",
        duration: 2000,
        style: { color: "green" },
      });
      navigate("/direct-messages");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <img
            className="mx-auto h-12 w-auto"
            src={UenrLogo}
            alt="University Chat Forum"
          />
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            <Link
              to="/auth/forgot-password"
              className="font-medium text-primary hover:cursor hover:underline"
            >
              Forgot your password?
            </Link>
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
              <Label htmlFor="indexNumber" className="sr-only">
                Index Number
              </Label>
              <Input
                {...register("indexNumber")}
                id="indexNumber"
                name="indexNumber"
                type="text"
                autoComplete="indexNumber"
                required
                className="relative block w-full appearance-none rounded-t-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                placeholder="Index Number"
              />
              {errors.indexNumber && (
                <span className="text-red-500 text-sm">
                  {errors.indexNumber.message}
                </span>
              )}
            </div>
            <div>
              <Label htmlFor="password" className="sr-only">
                Password
              </Label>
              <Input
                {...register("password")}
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full appearance-none rounded-b-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                placeholder="Password"
              />
              {errors.password && (
                <span className="text-red-500 text-sm">
                  {errors.password.message}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-foreground"
              >
                Remember me
              </Label>
            </div>
          </div>
          <div>
            <Button type="submit" className="w-full">
              {loading ? <Spinner className="text-white" /> : "Sign in"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
