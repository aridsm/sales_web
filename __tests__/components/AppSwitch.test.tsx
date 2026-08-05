import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import AppSwitch from "@/app/components/inputs/AppSwitch";

describe("AppSwitch", () => {
  it("renders correctly with label", () => {
    render(<AppSwitch value={false} onChange={vi.fn()} label="Enable Feature" />);
    const label = screen.getByText("Enable Feature");
    expect(label).toBeInTheDocument();
    
    const switchBtn = screen.getByRole("switch");
    expect(switchBtn).toBeInTheDocument();
    expect(switchBtn).toHaveAttribute("aria-checked", "false");
  });

  it("handles the true value", () => {
    render(<AppSwitch value={true} onChange={vi.fn()} />);
    const switchBtn = screen.getByRole("switch");
    expect(switchBtn).toHaveAttribute("aria-checked", "true");
    expect(switchBtn).toHaveClass("bg-indigo-500");
  });

  it("calls onChange when clicked", async () => {
    const handleChange = vi.fn();
    render(<AppSwitch value={false} onChange={handleChange} />);
    const switchBtn = screen.getByRole("switch");
    
    await userEvent.click(switchBtn);
    expect(handleChange).toHaveBeenCalledWith(true);
  });
});
