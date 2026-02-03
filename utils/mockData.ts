
import { Movie } from '../types';

export const MOCK_MOVIES: Movie[] = [
  {
    id: 1,
    title: "Inception",
    posterPath: "https://picsum.photos/seed/inception/600/900",
    rating: 8.8,
    duration: "2h 28m",
    genres: ["Sci-Fi", "Action"],
    overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    releaseYear: 2010
  },
  {
    id: 2,
    title: "The Grand Budapest Hotel",
    posterPath: "https://picsum.photos/seed/budapest/600/900",
    rating: 8.1,
    duration: "1h 39m",
    genres: ["Comedy", "Adventure"],
    overview: "A writer encounters the owner of a decaying high-class hotel, who tells him of his early years serving as a lobby boy in the hotel's glorious years under an exceptional concierge.",
    releaseYear: 2014
  },
  {
    id: 3,
    title: "Spider-Man: Across the Spider-Verse",
    posterPath: "https://picsum.photos/seed/spiderman/600/900",
    rating: 8.7,
    duration: "2h 20m",
    genres: ["Animation", "Action"],
    overview: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
    releaseYear: 2023
  },
  {
    id: 4,
    title: "La La Land",
    posterPath: "https://picsum.photos/seed/lalaland/600/900",
    rating: 8.0,
    duration: "2h 8m",
    genres: ["Musical", "Romance"],
    overview: "While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future.",
    releaseYear: 2016
  },
  {
    id: 5,
    title: "Everything Everywhere All at Once",
    posterPath: "https://picsum.photos/seed/eeaao/600/900",
    rating: 7.8,
    duration: "2h 19m",
    genres: ["Adventure", "Sci-Fi"],
    overview: "A middle-aged Chinese immigrant is swept up into an insane adventure in which she alone can save existence by exploring other universes and connecting with the lives she could have led.",
    releaseYear: 2022
  },
  {
    id: 6,
    title: "The Dark Knight",
    posterPath: "https://picsum.photos/seed/darkknight/600/900",
    rating: 9.0,
    duration: "2h 32m",
    genres: ["Action", "Crime"],
    overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    releaseYear: 2008
  }
];

export const generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'CINE-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};
