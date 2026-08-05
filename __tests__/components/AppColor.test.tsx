import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import AppColor from "@/app/components/inputs/AppColor";

describe("AppColor", () => {
  it("renders correctly with label and value", () => {
    render(<AppColor label="Pick a Color" value="#FF0000" />);
    expect(screen.getByText("Pick a Color")).toBeInTheDocument();

    // The hex text is rendered inside a span when closed
    const hexText = screen.getByText("#FF0000");
    expect(hexText).toBeInTheDocument();
  });

  it("toggles the color picker when clicked", async () => {
    render(<AppColor label="Pick a Color" value="#000000" />);

    // The dropdown container is the one with the hex text
    const trigger = screen.getByText("#000000").closest(".input-field");
    expect(screen.queryByPlaceholderText("#000000")).not.toBeInTheDocument(); // Initially closed

    await userEvent.click(trigger!);

    // Now it should be open, and the input should be visible
    const hexInput = screen.getByPlaceholderText("#000000");
    expect(hexInput).toBeInTheDocument();
  });

  it("calls onChange when typing a hex value", async () => {
    const handleChange = vi.fn();
    render(<AppColor value="" onChange={handleChange} />);

    // Open it first
    const trigger = screen
      .getByText("Selecione uma cor...")
      .closest(".input-field");
    await userEvent.click(trigger!);

    // Now type
    const hexInput = screen.getByPlaceholderText("#000000");
    await userEvent.type(hexInput, "#112233");

    expect(handleChange).toHaveBeenCalled();
  });
});
