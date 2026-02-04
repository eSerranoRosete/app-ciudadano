import {
  addToast,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { BellRingingIcon } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { useToggle } from "@uidotdev/usehooks";
import type { ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

interface IFProps {
  trigger: (onOpen: () => void) => ReactNode;
}

const formSchema = z.object({
  email: z.email(),
});

export const LeadForm = (props: IFProps) => {
  const [open, toggleOpen] = useToggle();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = useMutation({
    mutationFn: async (fields: z.infer<typeof formSchema>) => {
      console.log(fields);
    },
    onSuccess: () => {
      toggleOpen(false);
      addToast({
        variant: "solid",
        color: "success",
        title: "Todo listo!",
        description: "Se agendó la notificación",
      });
    },
    onError: () => {
      addToast({
        variant: "solid",
        color: "danger",
        title: "Oh no!",
        description: "Ocurrió un error al agendar la notificación",
      });
    },
  });

  return (
    <>
      {props.trigger(() => toggleOpen(true))}
      <Modal isOpen={open} onOpenChange={toggleOpen}>
        <ModalContent
          as={"form"}
          onSubmit={form.handleSubmit((d) => onSubmit.mutate(d))}
        >
          <ModalHeader>
            <div>
              <h1>Agendar Notificación</h1>
              <p className="text-sm font-normal">
                Se te enviará una notificación los días que opere este camion
                cuando se encuentre cerca de tu ubicación
              </p>
            </div>
          </ModalHeader>
          <ModalBody>
            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  type="email"
                  placeholder="email@ejemplo.com"
                  description="Ingresa tu correo electrónico"
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              fullWidth
              type="submit"
              color="primary"
              startContent={<BellRingingIcon className="size-5" />}
            >
              Notificarme
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
