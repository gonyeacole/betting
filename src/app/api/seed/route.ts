import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  return seed();
}

export async function POST() {
  return seed();
}

async function seed() {
  try {
    // Check if data already exists
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      return NextResponse.json({ message: "Database already seeded", users: existingUsers }, { status: 200 });
    }

    const password = await bcrypt.hash("password123", 12);

    const alice = await prisma.user.create({
      data: {
        name: "Alice Johnson",
        email: "alice@example.com",
        hashedPassword: password,
        bio: "NFL and NBA enthusiast. Spread specialist.",
      },
    });

    const bob = await prisma.user.create({
      data: {
        name: "Bob Smith",
        email: "bob@example.com",
        hashedPassword: password,
        bio: "Parlay king. High risk, high reward.",
      },
    });

    const charlie = await prisma.user.create({
      data: {
        name: "Charlie Davis",
        email: "charlie@example.com",
        hashedPassword: password,
        bio: "Soccer and tennis bettor. Value hunting.",
      },
    });

    const dana = await prisma.user.create({
      data: {
        name: "Dana Wilson",
        email: "dana@example.com",
        hashedPassword: password,
        bio: "MMA and boxing specialist.",
      },
    });

    await prisma.follow.createMany({
      data: [
        { followerId: alice.id, followingId: bob.id },
        { followerId: alice.id, followingId: charlie.id },
        { followerId: bob.id, followingId: alice.id },
        { followerId: charlie.id, followingId: alice.id },
        { followerId: charlie.id, followingId: dana.id },
        { followerId: dana.id, followingId: bob.id },
      ],
    });

    await prisma.bet.createMany({
      data: [
        {
          userId: alice.id, sport: "NFL", league: "NFL", eventName: "Chiefs vs Bills",
          eventDate: new Date("2026-01-12T20:00:00"), betType: "SPREAD", selection: "Chiefs -3.5",
          odds: -110, stake: 110, potentialPayout: 210, line: -3.5, result: "WON", profit: 100,
        },
        {
          userId: alice.id, sport: "NBA", eventName: "Lakers vs Celtics",
          eventDate: new Date("2026-01-15T19:30:00"), betType: "MONEYLINE", selection: "Lakers",
          odds: 150, stake: 50, potentialPayout: 125, result: "WON", profit: 75,
        },
        {
          userId: alice.id, sport: "NFL", league: "NFL", eventName: "Eagles vs Cowboys",
          eventDate: new Date("2026-01-19T16:00:00"), betType: "OVER_UNDER", selection: "Over 48.5",
          odds: -105, stake: 105, potentialPayout: 205, line: 48.5, result: "LOST", profit: -105,
        },
        {
          userId: alice.id, sport: "NBA", eventName: "Warriors vs Nuggets",
          eventDate: new Date("2026-03-28T21:00:00"), betType: "SPREAD", selection: "Warriors +4.5",
          odds: -110, stake: 55, potentialPayout: 105, line: 4.5, result: "PENDING",
        },
        {
          userId: alice.id, sport: "NBA", eventName: "Bucks vs Heat",
          eventDate: new Date("2026-03-27T19:00:00"), betType: "LIVE", selection: "Bucks ML",
          odds: -130, stake: 130, potentialPayout: 230, isLive: true, result: "PENDING",
          notes: "Took this at halftime when Bucks were down 5",
        },
        {
          userId: bob.id, sport: "MLB", league: "MLB", eventName: "Yankees vs Red Sox",
          eventDate: new Date("2026-03-20T13:05:00"), betType: "MONEYLINE", selection: "Yankees",
          odds: -140, stake: 140, potentialPayout: 240, result: "WON", profit: 100,
        },
        {
          userId: bob.id, sport: "NHL", league: "NHL", eventName: "Maple Leafs vs Bruins",
          eventDate: new Date("2026-03-22T19:00:00"), betType: "MONEYLINE", selection: "Maple Leafs",
          odds: 120, stake: 50, potentialPayout: 110, result: "LOST", profit: -50,
        },
        {
          userId: bob.id, sport: "NBA", eventName: "76ers vs Knicks",
          eventDate: new Date("2026-03-29T18:00:00"), betType: "OVER_UNDER", selection: "Under 215.5",
          odds: -115, stake: 115, potentialPayout: 215, line: 215.5, result: "PENDING",
        },
        {
          userId: charlie.id, sport: "Soccer", league: "Premier League", eventName: "Arsenal vs Manchester City",
          eventDate: new Date("2026-03-15T12:30:00"), betType: "MONEYLINE", selection: "Draw",
          odds: 240, stake: 25, potentialPayout: 85, result: "WON", profit: 60,
        },
        {
          userId: charlie.id, sport: "Tennis", league: "ATP", eventName: "Djokovic vs Alcaraz",
          eventDate: new Date("2026-03-18T10:00:00"), betType: "MONEYLINE", selection: "Alcaraz",
          odds: 110, stake: 100, potentialPayout: 210, result: "LOST", profit: -100,
        },
        {
          userId: charlie.id, sport: "Soccer", league: "La Liga", eventName: "Real Madrid vs Barcelona",
          eventDate: new Date("2026-03-30T15:00:00"), betType: "SPREAD", selection: "Barcelona +0.5",
          odds: -120, stake: 60, potentialPayout: 110, line: 0.5, result: "PENDING",
        },
        {
          userId: dana.id, sport: "MMA/UFC", league: "UFC", eventName: "UFC 310: Main Event",
          eventDate: new Date("2026-03-08T22:00:00"), betType: "MONEYLINE", selection: "Fighter A",
          odds: -200, stake: 200, potentialPayout: 300, result: "WON", profit: 100,
        },
        {
          userId: dana.id, sport: "Boxing", eventName: "Championship Bout",
          eventDate: new Date("2026-04-01T21:00:00"), betType: "MONEYLINE", selection: "Underdog",
          odds: 300, stake: 50, potentialPayout: 200, result: "PENDING",
          notes: "Good value on the underdog here",
        },
      ],
    });

    // Create parlays
    await prisma.parlay.create({
      data: {
        userId: bob.id, name: "Weekend Football Parlay", totalOdds: 595,
        stake: 25, potentialPayout: 173.75, isSameGame: false, result: "WON",
        legs: {
          create: [
            {
              userId: bob.id, sport: "NFL", eventName: "Chiefs vs Bills",
              eventDate: new Date("2026-01-12T20:00:00"), betType: "MONEYLINE", selection: "Chiefs",
              odds: -150, stake: 25, potentialPayout: 41.67, result: "WON", profit: 16.67,
            },
            {
              userId: bob.id, sport: "NFL", eventName: "49ers vs Packers",
              eventDate: new Date("2026-01-12T16:00:00"), betType: "SPREAD", selection: "49ers -3",
              odds: -110, stake: 25, potentialPayout: 47.73, line: -3, result: "WON", profit: 22.73,
            },
            {
              userId: bob.id, sport: "NFL", eventName: "Ravens vs Texans",
              eventDate: new Date("2026-01-12T13:00:00"), betType: "OVER_UNDER", selection: "Over 44.5",
              odds: -105, stake: 25, potentialPayout: 48.81, line: 44.5, result: "WON", profit: 23.81,
            },
          ],
        },
      },
    });

    await prisma.parlay.create({
      data: {
        userId: alice.id, name: "Lakers SGP", totalOdds: 450,
        stake: 10, potentialPayout: 55, isSameGame: true, result: "PENDING",
        legs: {
          create: [
            {
              userId: alice.id, sport: "NBA", eventName: "Lakers vs Celtics",
              eventDate: new Date("2026-03-28T19:30:00"), betType: "MONEYLINE", selection: "Lakers",
              odds: 130, stake: 10, potentialPayout: 23, result: "PENDING",
            },
            {
              userId: alice.id, sport: "NBA", eventName: "Lakers vs Celtics",
              eventDate: new Date("2026-03-28T19:30:00"), betType: "OVER_UNDER", selection: "Over 218.5",
              odds: -110, stake: 10, potentialPayout: 19.09, line: 218.5, result: "PENDING",
            },
          ],
        },
      },
    });

    // Add likes
    const allBets = await prisma.bet.findMany();
    for (const bet of allBets.slice(0, 5)) {
      const liker = [alice.id, bob.id, charlie.id, dana.id].find((uid) => uid !== bet.userId);
      if (liker) {
        await prisma.like.create({ data: { userId: liker, betId: bet.id } }).catch(() => {});
      }
    }

    return NextResponse.json({ message: "Database seeded successfully!", users: 4, bets: 13, parlays: 2 });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 });
  }
}
