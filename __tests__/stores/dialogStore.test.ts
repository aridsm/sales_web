import { describe, it, expect, beforeEach } from "vitest";
import { useDialogStore } from "@/stores/dialogStore";

describe("dialogStore", () => {
  // Reseta o estado da store antes de cada teste
  // para garantir que os testes são isolados entre si
  beforeEach(() => {
    useDialogStore.setState({
      open: false,
      options: { message: "", variant: "alert" },
    });
  });

  it("inicia fechado com opções padrão", () => {
    const state = useDialogStore.getState();

    expect(state.open).toBe(false);
    expect(state.options.message).toBe("");
    expect(state.options.variant).toBe("alert");
  });

  it("abre o dialog com as opções corretas", () => {
    useDialogStore.getState().openDialog({
      message: "Tem certeza?",
      variant: "confirm",
      confirmLabel: "Sim",
      cancelLabel: "Não",
    });

    const state = useDialogStore.getState();

    expect(state.open).toBe(true);
    expect(state.options.message).toBe("Tem certeza?");
    expect(state.options.variant).toBe("confirm");
    expect(state.options.confirmLabel).toBe("Sim");
    expect(state.options.cancelLabel).toBe("Não");
  });

  it("fecha o dialog mantendo as opções anteriores", () => {
    // Abre
    useDialogStore.getState().openDialog({
      message: "Erro inesperado",
      variant: "error",
    });
    expect(useDialogStore.getState().open).toBe(true);

    // Fecha
    useDialogStore.getState().closeDialog();

    const state = useDialogStore.getState();
    expect(state.open).toBe(false);
    // As opções são preservadas (não resetadas ao fechar)
    expect(state.options.message).toBe("Erro inesperado");
  });

  it("suporta dialog de sucesso", () => {
    useDialogStore.getState().openDialog({
      message: "Operação realizada com sucesso!",
      variant: "success",
    });

    const state = useDialogStore.getState();
    expect(state.open).toBe(true);
    expect(state.options.variant).toBe("success");
    expect(state.options.message).toBe("Operação realizada com sucesso!");
  });

  it("suporta callback onConfirm", () => {
    let confirmado = false;

    useDialogStore.getState().openDialog({
      message: "Confirmar exclusão?",
      variant: "confirm",
      onConfirm: () => {
        confirmado = true;
      },
    });

    // Simula o clique de "confirmar"
    const { options } = useDialogStore.getState();
    options.onConfirm?.();

    expect(confirmado).toBe(true);
  });

  it("suporta callback onCancel", () => {
    let cancelado = false;

    useDialogStore.getState().openDialog({
      message: "Cancelar operação?",
      variant: "confirm",
      onCancel: () => {
        cancelado = true;
      },
    });

    // Simula o clique de "cancelar"
    const { options } = useDialogStore.getState();
    options.onCancel?.();

    expect(cancelado).toBe(true);
  });

  it("sobrescreve opções ao abrir um novo dialog", () => {
    useDialogStore.getState().openDialog({
      message: "Primeiro dialog",
      variant: "alert",
      title: "Título 1",
    });

    useDialogStore.getState().openDialog({
      message: "Segundo dialog",
      variant: "error",
    });

    const state = useDialogStore.getState();
    expect(state.options.message).toBe("Segundo dialog");
    expect(state.options.variant).toBe("error");
    // O título não foi passado no segundo, então não deve estar presente
    expect(state.options.title).toBeUndefined();
  });
});
