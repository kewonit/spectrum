"use client";

import { useState, useEffect } from "react";
import { Krona_One } from 'next/font/google';

const krona = Krona_One({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: '400',
});

interface ResultsTableProps {
  csvUrl?: string;
  csvData?: string;
  title?: string;
}

interface TeamMember {
  name: string;
  college: string;
}

interface Team {
  teamNumber: string;
  members: TeamMember[];
}

export const ResultsTable = ({ csvUrl, csvData, title = "Results" }: ResultsTableProps) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndParseData = async () => {
      // If we have direct CSV data, use that
      if (csvData) {
        parseTeamCSVString(csvData);
        return;
      }
      
      // Otherwise fetch from URL
      if (csvUrl) {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(csvUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch CSV: ${response.status}`);
          }
          const text = await response.text();
          parseTeamCSVString(text);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch CSV data');
          console.error('Error fetching CSV:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    const parseTeamCSVString = (csvString: string) => {
      try {
        const rows = csvString.trim().split('\n');
        const parsedTeams: Team[] = [];
        let currentTeam: Team | null = null;
        
        rows.forEach(row => {
          const cols = row.split(',');
          
          // Check if this is a team header row
          if (cols[0].trim().startsWith('TEAM-')) {
            // Start a new team
            currentTeam = {
              teamNumber: cols[0].trim(),
              members: []
            };
            
            // If there's a member in the same row as team number
            if (cols[1]?.trim()) {
              currentTeam.members.push({
                name: cols[1].trim(),
                college: cols[2]?.trim() || ""
              });
            }
            
            parsedTeams.push(currentTeam);
          } 
          // Otherwise, if it has a name, it's a team member
          else if (currentTeam && cols[1]?.trim()) {
            currentTeam.members.push({
              name: cols[1].trim(),
              college: cols[2]?.trim() || ""
            });
          }
        });
        
        setTeams(parsedTeams);
        setFilteredTeams(parsedTeams);
      } catch (err) {
        console.error("Error parsing CSV:", err);
        setError("Failed to parse the CSV data");
      }
    };

    fetchAndParseData();
  }, [csvUrl, csvData]);

  // Filter teams based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTeams(teams);
      return;
    }
    
    const term = searchTerm.toLowerCase().trim();
    const filtered = teams.map(team => {
      // Find members that match the search term
      const matchingMembers = team.members.filter(member => 
        member.name.toLowerCase().includes(term) || 
        member.college.toLowerCase().includes(term)
      );
      
      // If any members match, include this team with only matching members
      if (matchingMembers.length > 0) {
        return {
          ...team,
          members: matchingMembers
        };
      }
      
      // If team number matches, include all members
      if (team.teamNumber.toLowerCase().includes(term)) {
        return team;
      }
      
      // No matches in this team
      return null;
    }).filter(Boolean) as Team[];
    
    setFilteredTeams(filtered);
  }, [searchTerm, teams]);

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-white border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
        </div>
        <p className="text-white/80 mt-4">Loading results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 text-center">
        <p className="text-red-300">Error loading results: {error}</p>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 text-center">
        <p className="text-white/80">No team data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 sm:p-8">
      <h3 className={`${krona.className} text-xl sm:text-2xl text-white mb-6 text-center sm:text-left`}>{title}</h3>
      
      {/* Search box */}
      <div className="mb-6">
        <div className="relative max-w-md mx-auto sm:mx-0">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-white/60" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
          </div>
          <input 
            type="search" 
            className="block w-full p-3 pl-10 text-sm bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white placeholder-white/60"
            placeholder="Search for team or member..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table for all screen sizes */}
      <div className="overflow-x-auto rounded-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-white/20">
              <th className="py-3 px-4 text-left text-white font-medium border-b border-white/20">Team</th>
              <th className="py-3 px-4 text-left text-white font-medium border-b border-white/20">Member Name</th>
              <th className="hidden sm:table-cell py-3 px-4 text-left text-white font-medium border-b border-white/20">College</th>
              <th className="py-3 px-4 text-left text-white font-medium border-b border-white/20">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeams.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 px-4 text-center text-white/80">No matching results found</td>
              </tr>
            ) : (
              filteredTeams.flatMap((team, teamIdx) => 
                team.members.map((member, memberIdx) => (
                  <tr 
                    key={`${teamIdx}-${memberIdx}`}
                    className={`${teamIdx % 2 === 0 ? 'bg-white/5' : 'bg-white/10'} hover:bg-white/20 transition-colors`}
                  >
                    {memberIdx === 0 ? (
                      <td 
                        rowSpan={team.members.length} 
                        className="py-3 px-4 font-medium text-white border-b border-white/10 align-top"
                      >
                        {team.teamNumber}
                      </td>
                    ) : null}
                    <td className="py-3 px-4 text-white/80 border-b border-white/10">{member.name}</td>
                    <td className="hidden sm:table-cell py-3 px-4 text-white/70 border-b border-white/10">{member.college}</td>
                    <td className="py-3 px-4 border-b border-white/10">
                      <span className="inline-flex items-center rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-100">
                        Qualified
                      </span>
                    </td>
                  </tr>
                ))
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
