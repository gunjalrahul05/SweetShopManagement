import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import Login from "../pages/Login";
import api from "../utils/api";

vi.mock("../utils/api");

describe("Login page", () => {
  it("renders and submits login form", async () => {
    const mockOnLogin = vi.fn();
    api.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: { user: { username: "tester" }, token: "tok" },
      },
    });

    render(
      <MemoryRouter>
        <Login onLogin={mockOnLogin} />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/Email/i), "test@example.com");
    await userEvent.type(screen.getByLabelText(/Password/i), "password");

    userEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() =>
      expect(mockOnLogin).toHaveBeenCalledWith({ username: "tester" }, "tok")
    );
  });
});
