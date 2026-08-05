import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import AppCheckbox from "@/app/components/inputs/AppCheckbox";

describe("AppCheckbox", () => {
  it("renders correctly", () => {
    render(<AppCheckbox aria-label="My Checkbox" />);
    const checkbox = screen.getByRole("checkbox", { name: /my checkbox/i });
    expect(checkbox).toBeInTheDocument();
  });

  it("handles checked state", () => {
    render(<AppCheckbox aria-label="Checkbox" checked readOnly />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("calls onChange when clicked", async () => {
    const handleChange = vi.fn();
    render(<AppCheckbox aria-label="Checkbox" onChange={handleChange} />);
    const checkbox = screen.getByRole("checkbox");

    await userEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(checkbox).toBeChecked();
  });
});
