import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import UenrLogo from "../assets/uenrLogo.svg";
import { z, ZodType } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ForgotPasswordProps } from "@/types";
import { baseUrl, postRequest } from "@/utils/services";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import EmailSuccess from "@/components/EmailSuccess";
import { Spinner } from "@/components/spinner";
import { useAuth } from "@/contexts/AuthContext";

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [isEmailSent, setIsEmailSent] = useState(false);
  const {token} = useAuth()

  const schema: ZodType<ForgotPasswordProps> = z.object({
    indexNumber: z
      .string()
      .length(10, {
        message: "Invalid indx number",
      })
      .nonempty({ message: "Index number is required" }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordProps>({ resolver: zodResolver(schema) });

  const onSubmit: SubmitHandler<ForgotPasswordProps> = async (data) => {
    setLoading(true);
    try {
      const response = await postRequest(
        `${baseUrl}/auth/forgot-password`,
        token,
        JSON.stringify(data)
      );
      setLoading(false);
      if (response.error) {
        toast({
          description: response.message,
          variant: response.error && "destructive",
          duration: 2000,
        });
        return;
      }
      toast({
        description: response.message,
        color: "green",
        duration: 2000,
        style: { color: "green" },
      });
      setIsEmailSent(true);
    } catch (error) {
      toast({ description: (error as Error).message, variant: "destructive" });
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <img
              className="mx-auto h-12 w-auto"
              src={UenrLogo}
              alt="University Chat Forum"
            />
          </div>
          {isEmailSent ? (
            <EmailSuccess />
          ) : (
            <>
              <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
                Forgot your password?
              </h2>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Enter your email address and we'll send you a link to reset your
                password.
              </p>
              {/* </div> */}
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
                </div>
                <div>
                  <Button type="submit" disabled={loading} className="w-full">
                  {loading ? <Spinner className="text-white" /> : "Send Email"}
                  </Button>
                  <Link
                    className="hover:cursor hover:underline block text-center mt-4 text-muted-foreground text-sm"
                    to="/auth/sign-in"
                  >
                    Return to sign in
                  </Link>
                </div>
              </form>{" "}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
