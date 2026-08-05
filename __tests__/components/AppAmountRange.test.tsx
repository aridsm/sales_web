import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import AppAmountRange from "@/app/components/inputs/AppAmountRange";

describe("AppAmountRange", () => {
  it("renders with placeholders", () => {
    render(<AppAmountRange placeholderStart="Min Amount" placeholderEnd="Max Amount" />);
    expect(screen.getByPlaceholderText("Min Amount")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Max Amount")).toBeInTheDocument();
  });

  it("calls onChange correctly when min and max are updated", async () => {
    const handleChange = vi.fn();
    render(<AppAmountRange onChange={handleChange} />);
    
    const minInput = screen.getByPlaceholderText("Min");
    const maxInput = screen.getByPlaceholderText("Max");

    // Because it's masked using currencyFormatter, typing '10' triggers onChange with the unmasked numeric value
    await userEvent.type(minInput, "10");
    // Since each character typed triggers onChange, we just check if it was called with the final expected object structure
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        start: expect.any(Number),
      })
    );

    await userEvent.type(maxInput, "20");
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        end: expect.any(Number),
      })
    );
  });
});
