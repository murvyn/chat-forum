import { Button } from "./ui/button";
import { Input } from "./ui/input";
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
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Plus } from "lucide-react";
import MultipleSelector, { Option } from "@/components/ui/multiple-selector";
import { useChat } from "@/contexts/ChatContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { baseUrl, postRequest } from "@/utils/services";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UserChat } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Spinner } from "./spinner";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const CreateChannelCard = () => {
  const { users, setChatId } = useChat();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate()
  const OPTIONS: Option[] = users.map((user) => ({
    label: `${user.firstName} ${user.lastName}`,
    value: user._id,
  }));
  const [error, setError] = useState("");
  const { toast } = useToast();

  const optionSchema = z.object({
    label: z.string(),
    value: z.string(),
    disable: z.boolean().optional(),
  });

  const FormSchema = z.object({
    users: z.array(optionSchema).min(2),
    channelName: z.string().min(3),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const createChannelMutation = useMutation({
    mutationFn: async (data: { name: string; members: string[] }) => {
      const response = await postRequest(
        `${baseUrl}/chats/create-group-chat`,
        token,
        JSON.stringify({
          data,
        })
      );
      console.log(response);
      if (response.error) {
        setError(response.message);
        toast({
          title: "Something went wrong",
          description: response.message,
          duration: 2000,
          variant: "destructive",
        });
        throw new Error(response.message);
      }
      return response.chat;
    },
    onError: (error: Error) => {
      setError(error.message);
      console.log("Error creating chat", error);
    },
    onSuccess: (chat: UserChat) => {
      form.reset({
        channelName: "",
        users: [],
      });
      setChatId(chat._id);
      navigate(`/channels/${chat._id}`)
      queryClient.invalidateQueries({ queryKey: ["userChats"] });
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const members = data.users.map((user) => user.value);
    createChannelMutation.mutate({ name: data.channelName, members });
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"ghost"} size={"icon"}>
          <Plus size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Channel</DialogTitle>
          <DialogDescription>
            Start a new group chat with your team.
          </DialogDescription>
        </DialogHeader>
        {createChannelMutation.isSuccess && (
          <Alert className="bg-green-200">
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>Channel created</AlertDescription>
          </Alert>
        )}
        {createChannelMutation.isError && (
          <Alert className="bg-rose-200">
            <AlertTitle className="text-sm">Error!</AlertTitle>
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6"
          >
            <FormField
              control={form.control}
              name="channelName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Name of your channel" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
              <Button disabled={createChannelMutation.isPending} type="submit">
                {createChannelMutation.isPending ? <Spinner /> : "Submit"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChannelCard;
