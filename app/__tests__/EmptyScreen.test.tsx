import React from "react";
import { render } from "@testing-library/react-native";
import EmptyScreen from "../EmptyScreen";

describe("EmptyScreen", () => {
  it("renders the empty screen message", () => {
    const { getByText } = render(<EmptyScreen />);
    expect(getByText("This is an empty screen.")).toBeTruthy();
  });
});
