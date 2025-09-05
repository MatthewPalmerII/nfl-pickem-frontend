import React, { useState, useEffect } from "react";
import api from "../utils/api";

const ViewPicks = () => {
  const [games, setGames] = useState([]);
  const [picks, setPicks] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(
    new Date().getFullYear()
  );

  useEffect(() => {
    fetchGamesAndPicks();
  }, [currentWeek, selectedSeason]);

  const fetchGamesAndPicks = async () => {
    try {
      setLoading(true);

      // Fetch picks for the current week (this includes game data)
      const picksResponse = await api.get(
        `/api/picks/week/${currentWeek}/all?season=${selectedSeason}`
      );
      const weekPicks = picksResponse.data || [];

      console.log(`📊 Week ${currentWeek} picks API response:`, weekPicks);

      // Extract unique games from picks data
      const gamesMap = new Map();
      weekPicks.forEach((pick) => {
        if (pick.gameId && !gamesMap.has(pick.gameId._id)) {
          gamesMap.set(pick.gameId._id, pick.gameId);
        }
      });

      const allGames = Array.from(gamesMap.values());
      console.log(
        `📊 All games from picks:`,
        allGames.map((g) => ({
          game: `${g.awayTeam} @ ${g.homeTeam}`,
          status: g.status,
        }))
      );

      // Filter to only show in-progress or finalized games
      const relevantGames = allGames.filter(
        (game) => game.status === "live" || game.status === "final"
      );

      console.log(
        `📊 Relevant games (live/final):`,
        relevantGames.map((g) => ({
          game: `${g.awayTeam} @ ${g.homeTeam}`,
          status: g.status,
        }))
      );

      setGames(relevantGames);
      setPicks(weekPicks);

      console.log(
        `📊 Week ${currentWeek} - Found ${relevantGames.length} relevant games and ${weekPicks.length} picks`
      );
    } catch (error) {
      console.error("Error fetching games and picks:", error);
    } finally {
      setLoading(false);
    }
  };

  const getGamePicks = (gameId) => {
    return picks.filter((pick) => pick.gameId === gameId);
  };

  const getPickStatus = (pick, game) => {
    if (game.status === "final") {
      if (pick.isCorrect === true) {
        return { text: "✅ Correct", color: "text-green-600" };
      } else if (pick.isCorrect === false) {
        return { text: "❌ Incorrect", color: "text-red-600" };
      }
    }
    return { text: "⏳ Pending", color: "text-yellow-600" };
  };

  const getGameStatusColor = (status) => {
    switch (status) {
      case "final":
        return "bg-green-100 text-green-800";
      case "live":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nfl-blue"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-nfl-blue mb-4">👀 View Picks</h1>
        <p className="text-xl text-gray-600">
          See everyone's picks for each game
        </p>
      </div>

      {/* Week Selector */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(
            (week) => (
              <button
                key={week}
                onClick={() => setCurrentWeek(week)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  currentWeek === week
                    ? "bg-nfl-blue text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Week {week}
              </button>
            )
          )}
        </div>
      </div>

      {/* Games List */}
      {games.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-2">🏈</div>
          <p>No games available for Week {currentWeek}.</p>
          <p className="text-sm">
            Only in-progress or finalized games are shown.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {games.map((game) => {
            const gamePicks = getGamePicks(game._id);
            const awayPicks = gamePicks.filter(
              (pick) => pick.selectedTeam === game.awayTeam
            ).length;
            const homePicks = gamePicks.filter(
              (pick) => pick.selectedTeam === game.homeTeam
            ).length;

            return (
              <div key={game._id} className="card">
                {/* Game Header */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">
                      {game.awayTeam} @ {game.homeTeam}
                    </h3>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm text-gray-500">
                        {new Date(game.date).toLocaleDateString()} at{" "}
                        {game.time}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGameStatusColor(
                          game.status
                        )}`}
                      >
                        {game.status === "final"
                          ? "Final"
                          : game.status === "live"
                          ? "Live"
                          : "Scheduled"}
                      </span>
                    </div>
                  </div>

                  {/* Game Score */}
                  {game.status === "final" && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-nfl-blue">
                        {game.awayScore} - {game.homeScore}
                      </div>
                      <div className="text-sm text-gray-600">
                        Winner: {game.winner}
                      </div>
                    </div>
                  )}
                </div>

                {/* Pick Distribution */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>
                      {game.awayTeam}: {awayPicks} picks
                    </span>
                    <span>
                      {game.homeTeam}: {homePicks} picks
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-nfl-blue h-2 rounded-full transition-all duration-300"
                      style={{
                        width:
                          gamePicks.length > 0
                            ? `${(awayPicks / gamePicks.length) * 100}%`
                            : "50%",
                      }}
                    ></div>
                  </div>
                </div>

                {/* Picks List */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 mb-2">
                    All Picks ({gamePicks.length} total)
                  </h4>

                  {gamePicks.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      No picks submitted for this game.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {gamePicks.map((pick) => {
                        const status = getPickStatus(pick, game);
                        return (
                          <div
                            key={pick._id}
                            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {pick.userId?.name || "Unknown User"}
                              </div>
                              <div className="text-sm text-gray-600">
                                Picked:{" "}
                                <span className="font-medium">
                                  {pick.selectedTeam}
                                </span>
                              </div>
                            </div>
                            <div
                              className={`text-sm font-medium ${status.color}`}
                            >
                              {status.text}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats Summary */}
      {games.length > 0 && (
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="card text-center">
            <div className="text-2xl font-bold text-nfl-blue mb-2">
              {games.length}
            </div>
            <div className="text-gray-600">Games</div>
          </div>

          <div className="card text-center">
            <div className="text-2xl font-bold text-nfl-blue mb-2">
              {picks.length}
            </div>
            <div className="text-gray-600">Total Picks</div>
          </div>

          <div className="card text-center">
            <div className="text-2xl font-bold text-nfl-blue mb-2">
              {games.filter((g) => g.status === "final").length}
            </div>
            <div className="text-gray-600">Finalized Games</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewPicks;
