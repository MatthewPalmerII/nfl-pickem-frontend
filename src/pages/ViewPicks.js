import React, { useState, useEffect } from "react";
import api from "../utils/api";
import WeekSelector from "../components/WeekSelector";

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
    return picks.filter((pick) => pick.gameId && pick.gameId._id === gameId);
  };

  const getAllUsers = () => {
    const userMap = new Map();
    picks.forEach((pick) => {
      if (pick.userId && !userMap.has(pick.userId._id)) {
        userMap.set(pick.userId._id, pick.userId);
      }
    });
    return Array.from(userMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  };

  const getUserPickForGame = (userId, gameId) => {
    return picks.find(
      (pick) =>
        pick.userId &&
        pick.userId._id === userId &&
        pick.gameId &&
        pick.gameId._id === gameId
    );
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
      <WeekSelector
        currentWeek={currentWeek}
        onWeekChange={setCurrentWeek}
        className="mb-8"
      />

      {/* Picks Grid */}
      {games.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-2">🏈</div>
          <p>No games available for Week {currentWeek}.</p>
          <p className="text-sm">
            Only in-progress or finalized games are shown.
          </p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-white border-r">
                  Player
                </th>
                {games.map((game) => (
                  <th
                    key={game._id}
                    className="px-4 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider min-w-[120px]"
                  >
                    <div className="text-xs">
                      {game.awayTeam} @ {game.homeTeam}
                    </div>
                    {game.status === "final" && (
                      <div className="text-xs text-gray-400 mt-1">
                        {game.awayScore} - {game.homeScore}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getAllUsers().map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap sticky left-0 bg-white border-r">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-nfl-blue flex items-center justify-center text-white font-bold text-sm">
                          {user.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  {games.map((game) => {
                    const userPick = getUserPickForGame(user._id, game._id);
                    return (
                      <td
                        key={`${user._id}-${game._id}`}
                        className="px-4 py-3 text-center"
                      >
                        {userPick ? (
                          <div
                            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              userPick.isCorrect === true
                                ? "bg-green-100 text-green-800"
                                : userPick.isCorrect === false
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {userPick.selectedTeam}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
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
              {picks.filter((pick) => pick.week === currentWeek).length}
            </div>
            <div className="text-gray-600">Week Picks</div>
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
