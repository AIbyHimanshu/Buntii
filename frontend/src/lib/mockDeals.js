// ILLUSTRATIVE MOCK DATA — example deal cards only.
// NOT live inventory, NOT real merchants. Replace with live data at launch.
import { Apple, Fish, Croissant } from "lucide-react";

export const MOCK_DEALS = [
  {
    id: "mock-strawberries",
    item: "Strawberries, 400g tray",
    shop: "The greengrocer on the corner",
    was: "£3.00",
    now: "90p",
    saved: "£2.10",
    goneBy: "GONE BY 5",
    icon: Apple,
  },
  {
    id: "mock-seabass",
    item: "Whole sea bass",
    shop: "The fishmonger your auntie rates",
    was: "£9.50",
    now: "£4.50",
    saved: "£5.00",
    goneBy: "GONE BY 6",
    icon: Fish,
  },
  {
    id: "mock-sourdough",
    item: "Sourdough loaf, this morning's",
    shop: "The bakery your nan trusts",
    was: "£3.80",
    now: "£1.50",
    saved: "£2.30",
    goneBy: "GONE BY 7",
    icon: Croissant,
  },
];
