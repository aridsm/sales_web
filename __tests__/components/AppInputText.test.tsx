import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import AppInputText from "@/app/components/inputs/AppInputText";

describe("AppInputText", () => {
  it("renders correctly with default props", () => {
    render(<AppInputText placeholder="Type here" />);
    const input = screen.getByPlaceholderText("Type here");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "text");
  });

  it("renders the label and associates it with the input", () => {
    render(<AppInputText label="Username" />);
    const input = screen.getByLabelText("Username");
    expect(input).toBeInTheDocument();
    expect(input.id).toBe("Username"); // Based on component implementation
  });

  it("calls onChange when typed into", async () => {
    const handleChange = vi.fn();
    render(<AppInputText onChange={handleChange} />);
    const input = screen.getByRole("textbox");
    
    await userEvent.type(input, "Hello");
    // userEvent.type triggers multiple onChange events
    expect(handleChange).toHaveBeenCalled();
  });

  it("applies error class and displays error message", () => {
    render(<AppInputText error="Invalid input" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("border-red-500!");
    const errorMessage = screen.getByText("Invalid input");
    expect(errorMessage).toBeInTheDocument();
  });

  it("handles formatting via mask properly", async () => {
    const mask = {
      mask: (val: any) => `MASKED-${val}`,
      unmask: (val: string) => val.replace("MASKED-", ""),
    };
    
    const handleChange = vi.fn();
    render(<AppInputText value="123" mask={mask} onChange={handleChange} />);
    
    const input = screen.getByRole("textbox");
    // It should display masked value when not focused
    expect(input).toHaveValue("MASKED-123");
    
    // When focused, it displays localValue (which would be the raw value)
    fireEvent.focus(input);
    expect(input).toHaveValue("123");

    // Typing when focused
    await userEvent.type(input, "4");
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ value: "1234" }),
      })
    );
  });
});
