import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import api from "../utils/api";

vi.mock("../utils/api");

const sweetsMock = [
  { _id: "1", name: "Chocolate", category: "Choco", price: 2.5, quantity: 10 },
  { _id: "2", name: "Gummy", category: "Candy", price: 1.0, quantity: 0 },
];

describe("Dashboard", () => {
  it("fetches and displays sweets", async () => {
    api.get.mockResolvedValueOnce({
      data: { success: true, data: sweetsMock },
    });

    render(
      <MemoryRouter>
        <Dashboard
          user={{ username: "user", role: "user" }}
          onLogout={() => {}}
        />
      </MemoryRouter>
    );

    await waitFor(() => expect(api.get).toHaveBeenCalledWith("/sweets"));

    expect(await screen.findByText(/Chocolate/)).toBeInTheDocument();
    expect(await screen.findByText(/Gummy/)).toBeInTheDocument();
  });
});
