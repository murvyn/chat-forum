import { getInitials } from "@/utils/helpers";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { UserGroupChatWithId, UserProps } from "@/types";
import { UserList } from "./UserList";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "./ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { baseUrl, putRequest } from "@/utils/services";
import { Edit, X } from "lucide-react";
import { useToast } from "./ui/use-toast";

interface UserCardProps {
  user: UserProps;
  sharedCourses: { _id: string; name: string }[];
  type: "direct" | "course";
  channel: UserGroupChatWithId;
}

export function RecipientInfoCard({
  user,
  sharedCourses,
  type,
  channel,
}: UserCardProps) {
  const initials = getInitials(user?.firstName, user?.lastName);
  const { user: currentUser, token } = useAuth();
  const [edit, setEdit] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const editGroupMutation = useMutation({
    mutationFn: async (channelName: string) => {
      const response = await putRequest(
        `${baseUrl}/chats/group-chat/edit-group`,
        token,
        JSON.stringify({ channelName, chatId: channel?.chatId })
      );
      if (response.error) {
        toast({
          title: "Something went wrong",
          description: response.message,
          duration: 2000,
          variant: "destructive",
        });
        throw new Error(response.message);
      }
    },
    onSuccess: () => {
      setEdit(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["userChats"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const scheme = z.object({
    channelName: z.string().min(3),
  });

  const form = useForm({
    resolver: zodResolver(scheme),
    defaultValues: {
      channelName: "",
    },
  });

  const isOwner = useMemo(
    () => (channel?.owner ? channel?.owner === currentUser?._id : false),
    [channel?.owner, currentUser]
  );

  const onSubmit: SubmitHandler<{ channelName: string }> = (data) => {
    editGroupMutation.mutate(data.channelName);
  };

  return (
    <div className="bg-white shadow-lg mt-[24px] p-4 rounded-lg w-96 border">
      <div className="flex items-center">
        {type === "direct" ? (
          <>
            <Avatar className="w-16 h-16">
              <AvatarImage
                src={user?.photoUrl}
                alt={`${user?.firstName} ${user?.lastName}`}
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="ml-4">
              <h2 className="text-lg font-semibold">{`${user?.firstName} ${user?.lastName}`}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <p className="text-sm text-gray-500">Active 2 mins ago</p>
              <div className="mt-2">
                <p className="text-sm text-gray-600">Courses:</p>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {sharedCourses.map((course) => (
                    <li key={course._id}>{course.name}</li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="w-full">
              {isOwner ? (
                <>
                  {edit ? (
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="w-full space-y-6"
                      >
                        <div className="flex items-end w-full">
                          <FormField
                            control={form.control}
                            name="channelName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Channel name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            variant={"ghost"}
                            size={"icon"}
                            onClick={() => setEdit(false)}
                          >
                            <X size={18} />
                          </Button>
                        </div>
                        <Button type="submit" className="w-full">
                          Submit
                        </Button>
                      </form>
                    </Form>
                  ) : (
                    <div className="flex items-center">
                      <h2 className="text-lg font-semibold">{channel?.name}</h2>
                      <Button
                        variant={"ghost"}
                        size={"icon"}
                        onClick={() => setEdit(true)}
                      >
                        <Edit size={18} />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <h2 className="text-lg font-semibold">{channel?.name}</h2>
              )}
              <div className="mt-2">
                <div className="mt-2">
                  <UserList
                    users={channel?.users as UserProps[]}
                    chatId={channel.chatId as string}
                    isOwner={isOwner}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
