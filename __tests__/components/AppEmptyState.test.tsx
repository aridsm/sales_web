import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AppEmptyState from "@/app/components/AppEmptyState";

// Mock useTranslation
vi.mock("@/app/utils/i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => `translated_${key}`,
  }),
}));

describe("AppEmptyState", () => {
  it("renders with default translation strings", () => {
    render(<AppEmptyState />);
    const title = screen.getByText("translated_labels.grid.empty_title");
    const subtitle = screen.getByText("translated_labels.grid.empty_subtitle");
    expect(title).toBeInTheDocument();
    expect(subtitle).toBeInTheDocument();
  });

  it("renders with custom title and subtitle", () => {
    render(<AppEmptyState title="Custom Title" subtitle="Custom Subtitle" />);
    expect(screen.getByText("Custom Title")).toBeInTheDocument();
    expect(screen.getByText("Custom Subtitle")).toBeInTheDocument();
  });

  it("does not render subtitle if subtitle is explicitly null", () => {
    render(<AppEmptyState title="Custom Title" subtitle={null as any} />);
    expect(screen.getByText("Custom Title")).toBeInTheDocument();
    expect(
      screen.queryByText("translated_labels.grid.empty_subtitle"),
    ).not.toBeInTheDocument();
  });

  it("renders a custom icon", () => {
    render(
      <AppEmptyState icon={<span data-testid="custom-icon">Icon</span>} />,
    );
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("applies custom classNames", () => {
    const { container } = render(
      <AppEmptyState
        className="my-custom-class"
        iconClassName="my-icon-class"
      />,
    );
    // The outermost div should have the custom className
    expect(container.firstChild).toHaveClass("my-custom-class");

    // The icon wrapper should have the iconClassName
    const iconWrapper = container.querySelector(".my-icon-class");
    expect(iconWrapper).toBeInTheDocument();
  });
});
