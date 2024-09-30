import SheetSideBar from "@/components/SheetSideBar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronDown, Edit } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { z, ZodType } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";
import { useCallback } from "react";
import { Spinner } from "@/components/spinner";
import { Label } from "@/components/ui/label";
import { AvatarImage } from "@radix-ui/react-avatar";
import { getInitials } from "@/utils/helpers";
import { baseUrl, putRequest } from "@/utils/services";
import { useMutation } from "@tanstack/react-query";
// import { useNavigate } from "react-router-dom";

interface Props {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const UserProfile = () => {
  const { user, setUser, token } = useAuth();
  const { toast } = useToast();

  const schema: ZodType<Props> = z
    .object({
      oldPassword: z.string().nonempty({ message: "Password is required" }),
      newPassword: z
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
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Props>({ resolver: zodResolver(schema) });

  const uploadProfileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch(`${baseUrl}/auth`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        credentials: "include",
      });
      console.log(response)
      if (!response.ok) {
        toast({
          title: "Something went wrong",
          description: "Failed to update user image",
          duration: 2000,
          variant: "destructive",
        });
        throw new Error("Failed to update user image")
      }
      return response.json()
    },
    onError: (error: Error) => {
      console.log("Error updating user", error);
      toast({
        description: "Failed to update user",
        variant: "destructive",
      });
    },
    onSuccess: (response) => {
      if (response.error) {
        toast({
          title: 'Failed to update user',
          description: response.message,
          variant: "destructive",
          duration: 2000,
        });
      } else {
        setUser(response.user);
        sessionStorage.setItem("user", JSON.stringify(response.user));
      }
    },
  })

  const changePasswordMutation = useMutation({
    mutationFn: async (password: { oldPassword: string, newPassword: string }) => {
      return await putRequest(`${baseUrl}/auth`, token, JSON.stringify(password));
    },
    onError: (error: Error) => {
      console.log("Error updating user", error);
      toast({
        description: "Failed to update user",
        variant: "destructive",
      });
    },
    onSuccess: (response) => {
      if (response.error) {
        toast({
          title: 'Failed to update user',
          description: response.message,
          variant: "destructive",
          duration: 2000,
        });
      } else {
        toast({
          description: "Password changed",
          color: "green",
          duration: 2000,
          style: { color: "green" },
        })
        reset()
      }
    }
  })

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files) {
        const selectedFiles = event.target.files[0]
        await uploadProfileMutation.mutateAsync(selectedFiles)
      }
    },
    []
  );

  const onSubmit: SubmitHandler<Props> = async (data) => {
    await changePasswordMutation.mutateAsync({
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
    });
  };

  return (
    <div>
      <div className="md:hidden mt-[20px]">
        <SheetSideBar />
      </div>
      <div className="">
        <div className="flex-1 p-4 bg-muted/10">
          <p className="text-2xl font-semibold mt-10 mb-5">
            Welcome, {user?.firstName} {user?.lastName}!
          </p>
          <Avatar className="h-36  shadow-md w-36 relative">
            <AvatarImage className="object-cover w-full" alt="avatar" src={user?.photoUrl} />
            <AvatarFallback>{getInitials(user?.firstName as string, user?.lastName as string)}</AvatarFallback>
            <div className="absolute w-full h-full flex items-end ">
              {uploadProfileMutation.isPending ? <div className="bg-white w-full h-full bg-opacity-50 z-40 flex items-center justify-center">
                <Spinner className="text-black" />
              </div> :
                <div className="flex items-center w-full h-[20%] justify-center bg-black z-30 bg-opacity-60">
                  <Label
                    htmlFor="file"
                    className="flex h-9 w-9 items-center justify-center flex-col cursor-pointer"
                  >
                    <input
                      title="file"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="file"
                      onChange={handleFileChange}
                    />
                    <Edit color="white" size={20} />
                  </Label>
                </div>
              }
            </div>
          </Avatar>
          <h1 className="text-2xl font-bold my-5">User Info</h1>
          <div className="max-w-3xl grid pl-2 grid-cols-2 gap-4">
            <Input
              disabled
              value={user?.firstName.toUpperCase()}
              className="truncate bg-gray-100"
              placeholder="First Name"
            />
            <Input
              disabled
              className="truncate bg-gray-100"
              value={user?.lastName.toUpperCase()}
              placeholder="Last Name"
            />
            <Input
              className="truncate bg-gray-100"
              value={user?.email}
              disabled
              placeholder="Email"
            />
            <Input
              className="truncate bg-gray-100 "
              value={user?.role.toUpperCase()}
              disabled
              placeholder="Role"
            />
            <Input
              value={user?.department.name.toUpperCase()}
              className="truncate bg-gray-100 "
              disabled
              placeholder="Department"
            />
            <DropdownMenu>
              <DropdownMenuTrigger className="flex justify-between h-10 rounded-md border-input px-3 py-2 text-sm border text-muted-foreground bg-gray-100 w-full text-start ">
                <span>Courses</span>
                <ChevronDown />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {user?.courses.map((course) => (
                  <DropdownMenuItem
                    //   onClick={() => navigate(`/channels/${course._id}`)}
                    key={course._id}
                  >
                    {course.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Accordion className="w-64" type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger className="flex text-sm ml-3 text-muted-foreground pb-2">
                Change password
              </AccordionTrigger>
              <AccordionContent>
                <form
                  className="flex flex-col gap-2 p-2"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <Input
                    {...register("oldPassword")}
                    type="password"
                    className="bg-gray-100"
                    placeholder="Old Password"
                  />
                  {errors.oldPassword && (
                    <span className="text-rose-700 text-xs">
                      {errors.oldPassword.message}
                    </span>
                  )}
                  <Input
                    type="password"
                    {...register("newPassword")}
                    className="bg-gray-100 "
                    placeholder="New Password"
                  />
                  {errors.newPassword && (
                    <span className="text-rose-700 text-xs">
                      {errors.newPassword.message}
                    </span>
                  )}
                  <Input
                    type="password"
                    {...register("confirmPassword")}
                    className="bg-gray-100 "
                    placeholder="Confirm Password"
                  />
                  {errors.confirmPassword && (
                    <span className="text-rose-700 text-xs">
                      {errors.confirmPassword.message}
                    </span>
                  )}
                  <Button disabled={changePasswordMutation.isPending} type="submit">
                    {changePasswordMutation.isPending ? <Spinner /> : "Submit"}
                  </Button>
                </form>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Add user profile content here */}

        <div className="flex-1 p-4 bg-muted/10">
          <h1>User Settings</h1>
        </div>

        {/* Add user settings content here */}

        <div className="flex-1 p-4 bg-muted/10">
          <h1>User Activity</h1>
        </div>

        {/* Add user activity content here */}
      </div>
    </div>
  );
};

export default UserProfile;
