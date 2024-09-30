import { useCallback, useMemo, useState } from "react";
import { UserProps } from "@/types";
import { getInitials } from "@/utils/helpers";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { FaCrown } from "react-icons/fa";
import { useSocket } from "@/contexts/SocketContext";
import { Plus, X } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import MultipleSelector, { Option } from "./ui/multiple-selector";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { baseUrl, postRequest, putRequest } from "@/utils/services";
import { useChat } from "@/contexts/ChatContext";
import { Spinner } from "./spinner";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "./ui/use-toast";

interface UserListProps {
  users: UserProps[];
  chatId: string;
  isOwner?: boolean;
}

export function UserList({ users, chatId, isOwner }: UserListProps) {
  const [search, setSearch] = useState<string>("");
  const { users: allUsers } = useChat();
  const { onlineUsers } = useSocket();
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const { toast } = useToast();

  const filteredUsers = users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(search.toLowerCase()) ||
      user.lastName.toLowerCase().includes(search.toLowerCase())
  );

  const OPTIONS: Option[] = useMemo(
    () =>
      allUsers
        .filter((user) => !users.some((u) => u._id === user._id))
        .map((user) => ({
          label: `${user.firstName} ${user.lastName}`,
          value: user._id,
        })),
    [users, allUsers]
  );

  const removerMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const response = await putRequest(
        `${baseUrl}/chats/group-chat/remove-member`,
        token,
        JSON.stringify({ chatId, memberId })
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
      queryClient.invalidateQueries({ queryKey: ["userChats"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
  const addMemberMutation = useMutation({
    mutationFn: async (memberId: string[]) => {
      const response = await postRequest(
        `${baseUrl}/chats/group-chat/add-member`,
        token,
        JSON.stringify({ chatId, memberId })
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
      toast({
        title: "Success",
        description: "Member has been added",
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ["userChats"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      form.reset({ users: [] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const handleRemoveMember = useCallback(async (id: string) => {
    await removerMemberMutation.mutateAsync(id);
  }, []);

  const optionSchema = z.object({
    label: z.string(),
    value: z.string(),
    disable: z.boolean().optional(),
  });

  const FormSchema = z.object({
    users: z.array(optionSchema).min(1),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const members = data.users.map((user) => user.value);
    await addMemberMutation.mutateAsync(members);
  }

  return (
    <div className="max-w-96 w-full">
      <Input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />
      <div className="grid grid-cols-1 ">
        {isOwner && (
          <Dialog>
            <DialogTrigger asChild className="w-full">
              <Button
                variant={"ghost"}
                className="flex h-auto shadow-md py-2 justify-start space-x-4 items-center"
              >
                <div className="w-12 h-12  bg-neutral-200 rounded-full flex items-center justify-center">
                  <Plus />
                </div>
                <p>Add new member</p>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add</DialogTitle>
                <DialogDescription>Add new members</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="w-full space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="users"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Add users</FormLabel>
                        <FormControl>
                          <MultipleSelector
                            {...field}
                            defaultOptions={OPTIONS}
                            placeholder="Select users you like..."
                            emptyIndicator={
                              <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                no results found.
                              </p>
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">
                      {addMemberMutation.isPending ? <Spinner /> : "Add"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
        <div className="overflow-y-auto h-[20rem]">
          {filteredUsers.map((user) => {
            const isOnline = onlineUsers.some(
              (onlineUser) => onlineUser.userId === user._id
            );
            return (
              <div key={user._id} className="flex items-center">
                <Button
                  variant={"ghost"}
                  className="flex w-full space-x-4 justify-start h-auto items-center"
                >
                  <div className="relative flex space-x-4">
                    <Avatar
                      className={`w-12 h-12 ${
                        user.role !== "student"
                          ? "border-solid border-4 border-primary"
                          : ""
                      } `}
                    >
                      <AvatarImage
                        className="w-full object-cover"
                        src={user.photoUrl}
                      />
                      <AvatarFallback>
                        {getInitials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 bg-green-500 border-2 text-xs text-white border-white rounded-full w-4 h-4 flex items-center justify-center">
                        {user.role !== "student" && <FaCrown />}
                      </span>
                    )}
                  </div>
                  <p className="text-sm mt-1">{`${user.firstName} ${user.lastName}`}</p>
                </Button>
                {isOwner && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant={"ghost"} size="icon" className="">
                        <X size={20} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          this member from your group.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemoveMember(user._id)}
                        >
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
