import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import AppSelect from "@/app/components/inputs/AppSelect";

describe("AppSelect", () => {
  const options = [
    { id: "1", name: "Option 1" },
    { id: "2", name: "Option 2" },
    { id: "3", name: "Option 3" },
  ];

  it("renders correctly with placeholder", () => {
    render(<AppSelect options={options} placeholder="Select an option" />);
    const placeholder = screen.getByText("Select an option");
    expect(placeholder).toBeInTheDocument();
  });

  it("opens dropdown and selects an option", async () => {
    const handleChange = vi.fn();
    const { baseElement } = render(
      <AppSelect options={options} placeholder="Select an option" onChange={handleChange} />
    );

    // The trigger is a div with the placeholder text
    const trigger = screen.getByText("Select an option");
    await userEvent.click(trigger);

    // The dropdown is rendered via portal, so we search in baseElement
    const optionToSelect = await within(baseElement).findByText("Option 2");
    expect(optionToSelect).toBeInTheDocument();

    await userEvent.click(optionToSelect);
    
    // Check if onChange was called with the correct ID
    expect(handleChange).toHaveBeenCalledWith("2");
  });

  it("displays the selected value", () => {
    render(<AppSelect options={options} value="3" />);
    expect(screen.getByText("Option 3")).toBeInTheDocument();
  });
});
