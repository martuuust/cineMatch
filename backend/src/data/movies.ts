/**
 * CineMatch Backend - Mock Movie Data
 * 20 movies for deterministic voting order
 */

import { Movie } from '../types';

export const MOCK_MOVIES: Movie[] = [
    {
        id: 1,
        title: "Inception",
        posterPath: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Ber.jpg",
        rating: 8.8,
        duration: 148,
        genres: ["Sci-Fi", "Action", "Thriller"],
        overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O."
    },
    {
        id: 2,
        title: "The Grand Budapest Hotel",
        posterPath: "https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg",
        rating: 8.1,
        duration: 99,
        genres: ["Comedy", "Adventure", "Drama"],
        overview: "A writer encounters the owner of a decaying high-class hotel, who tells him of his early years serving as a lobby boy in the hotel's glorious years under an exceptional concierge."
    },
    {
        id: 3,
        title: "Spider-Man: Across the Spider-Verse",
        posterPath: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
        rating: 8.7,
        duration: 140,
        genres: ["Animation", "Action", "Adventure"],
        overview: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence."
    },
    {
        id: 4,
        title: "La La Land",
        posterPath: "https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
        rating: 8.0,
        duration: 128,
        genres: ["Musical", "Romance", "Drama"],
        overview: "While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future."
    },
    {
        id: 5,
        title: "Everything Everywhere All at Once",
        posterPath: "https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg",
        rating: 7.8,
        duration: 139,
        genres: ["Adventure", "Sci-Fi", "Comedy"],
        overview: "A middle-aged Chinese immigrant is swept up into an insane adventure in which she alone can save existence by exploring other universes and connecting with the lives she could have led."
    },
    {
        id: 6,
        title: "The Dark Knight",
        posterPath: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        rating: 9.0,
        duration: 152,
        genres: ["Action", "Crime", "Drama"],
        overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice."
    },
    {
        id: 7,
        title: "Parasite",
        posterPath: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
        rating: 8.5,
        duration: 132,
        genres: ["Thriller", "Drama", "Comedy"],
        overview: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan."
    },
    {
        id: 8,
        title: "Interstellar",
        posterPath: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        rating: 8.6,
        duration: 169,
        genres: ["Sci-Fi", "Adventure", "Drama"],
        overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival."
    },
    {
        id: 9,
        title: "The Shawshank Redemption",
        posterPath: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
        rating: 9.3,
        duration: 142,
        genres: ["Drama", "Crime"],
        overview: "Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison."
    },
    {
        id: 10,
        title: "Pulp Fiction",
        posterPath: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
        rating: 8.9,
        duration: 154,
        genres: ["Crime", "Drama", "Comedy"],
        overview: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption."
    },
    {
        id: 11,
        title: "Whiplash",
        posterPath: "https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg",
        rating: 8.5,
        duration: 107,
        genres: ["Drama", "Music"],
        overview: "A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student's potential."
    },
    {
        id: 12,
        title: "The Matrix",
        posterPath: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
        rating: 8.7,
        duration: 136,
        genres: ["Sci-Fi", "Action"],
        overview: "When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth--the life he knows is the elaborate deception of an evil cyber-intelligence."
    },
    {
        id: 13,
        title: "Coco",
        posterPath: "https://image.tmdb.org/t/p/w500/eKi8dIrr8voobbaGzDpe8w0PVbC.jpg",
        rating: 8.4,
        duration: 105,
        genres: ["Animation", "Family", "Fantasy"],
        overview: "Despite his family's baffling generations-old ban on music, Miguel dreams of becoming an accomplished musician like his idol, Ernesto de la Cruz."
    },
    {
        id: 14,
        title: "Spirited Away",
        posterPath: "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
        rating: 8.6,
        duration: 125,
        genres: ["Animation", "Fantasy", "Adventure"],
        overview: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts."
    },
    {
        id: 15,
        title: "The Godfather",
        posterPath: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
        rating: 9.2,
        duration: 175,
        genres: ["Crime", "Drama"],
        overview: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son."
    },
    {
        id: 16,
        title: "Dune",
        posterPath: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
        rating: 8.0,
        duration: 155,
        genres: ["Sci-Fi", "Adventure", "Drama"],
        overview: "Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe to ensure the future of his family and his people."
    },
    {
        id: 17,
        title: "Oppenheimer",
        posterPath: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
        rating: 8.5,
        duration: 180,
        genres: ["Drama", "History", "Biography"],
        overview: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb."
    },
    {
        id: 18,
        title: "Get Out",
        posterPath: "https://image.tmdb.org/t/p/w500/tFXcEccSQMf3lfhfXKSU9iRBpa3.jpg",
        rating: 7.7,
        duration: 104,
        genres: ["Horror", "Thriller", "Mystery"],
        overview: "A young African-American visits his white girlfriend's parents for the weekend, where his simmering uneasiness about their reception of him eventually reaches a boiling point."
    },
    {
        id: 19,
        title: "Barbie",
        posterPath: "https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",
        rating: 7.0,
        duration: 114,
        genres: ["Comedy", "Adventure", "Fantasy"],
        overview: "Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land. However, when they get a chance to go to the real world, they soon discover the joys and perils of living among humans."
    },
    {
        id: 20,
        title: "Your Name",
        posterPath: "https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6babgKnONONX.jpg",
        rating: 8.4,
        duration: 106,
        genres: ["Animation", "Romance", "Fantasy"],
        overview: "High schoolers Mitsuha and Taki are complete strangers living separate lives. But one night, they suddenly switch places."
    }
];
