/**
 * CineMatch Backend - Mock Movie Data
 * 20 movies for deterministic voting order
 */

import { Movie } from '../types';

export const MOCK_MOVIES: Movie[] = [
    {
        id: 1,
        title: "Origen",
        posterPath: "https://image.tmdb.org/t/p/original/9gk7adHYeDvHkCSEqAvQNLV5Ber.jpg",
        rating: 8.8,
        duration: 148,
        genres: ["Ciencia Ficción", "Acción", "Suspense"],
        overview: "Un ladrón que roba secretos corporativos a través del uso de la tecnología de compartir sueños, se le da la tarea inversa de plantar una idea en la mente de un C.E.O."
    },
    {
        id: 2,
        title: "El Gran Hotel Budapest",
        posterPath: "https://image.tmdb.org/t/p/original/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg",
        rating: 8.1,
        duration: 99,
        genres: ["Comedia", "Aventura", "Drama"],
        overview: "Un escritor se encuentra con el dueño de un hotel de clase alta en decadencia, quien le cuenta sobre sus primeros años sirviendo como botones en los años gloriosos del hotel bajo un conserje excepcional."
    },
    {
        id: 3,
        title: "Spider-Man: Cruzando el Multiverso",
        posterPath: "https://image.tmdb.org/t/p/original/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
        rating: 8.7,
        duration: 140,
        genres: ["Animación", "Acción", "Aventura"],
        overview: "Miles Morales se catapulta a través del Multiverso, donde se encuentra con un equipo de Spider-People encargados de proteger su propia existencia."
    },
    {
        id: 4,
        title: "La La Land",
        posterPath: "https://image.tmdb.org/t/p/original/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
        rating: 8.0,
        duration: 128,
        genres: ["Musical", "Romance", "Drama"],
        overview: "Mientras navegan por sus carreras en Los Ángeles, un pianista y una actriz se enamoran mientras intentan reconciliar sus aspiraciones para el futuro."
    },
    {
        id: 5,
        title: "Todo a la vez en todas partes",
        posterPath: "https://image.tmdb.org/t/p/original/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg",
        rating: 7.8,
        duration: 139,
        genres: ["Aventura", "Ciencia Ficción", "Comedia"],
        overview: "Una inmigrante china de mediana edad se ve envuelta en una aventura loca en la que ella sola puede salvar la existencia explorando otros universos y conectándose con las vidas que podría haber llevado."
    },
    {
        id: 6,
        title: "El Caballero Oscuro",
        posterPath: "https://image.tmdb.org/t/p/original/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        rating: 9.0,
        duration: 152,
        genres: ["Acción", "Crimen", "Drama"],
        overview: "Cuando la amenaza conocida como el Joker causa estragos y caos en la gente de Gotham, Batman debe aceptar una de las mayores pruebas psicológicas y físicas de su capacidad para luchar contra la injusticia."
    },
    {
        id: 7,
        title: "Parásitos",
        posterPath: "https://image.tmdb.org/t/p/original/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
        rating: 8.5,
        duration: 132,
        genres: ["Suspense", "Drama", "Comedia"],
        overview: "La codicia y la discriminación de clase amenazan la recién formada relación simbiótica entre la rica familia Park y el clan Kim indigente."
    },
    {
        id: 8,
        title: "Interstellar",
        posterPath: "https://image.tmdb.org/t/p/original/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        rating: 8.6,
        duration: 169,
        genres: ["Ciencia Ficción", "Aventura", "Drama"],
        overview: "Un equipo de exploradores viaja a través de un agujero de gusano en el espacio en un intento de asegurar la supervivencia de la humanidad."
    },
    {
        id: 9,
        title: "Cadena Perpetua",
        posterPath: "https://image.tmdb.org/t/p/original/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
        rating: 9.3,
        duration: 142,
        genres: ["Drama", "Crimen"],
        overview: "Acusado injustamente en la década de 1940 por el doble asesinato de su esposa y su amante, el banquero Andy Dufresne comienza una nueva vida en la prisión de Shawshank."
    },
    {
        id: 10,
        title: "Pulp Fiction",
        posterPath: "https://image.tmdb.org/t/p/original/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
        rating: 8.9,
        duration: 154,
        genres: ["Crimen", "Drama", "Comedia"],
        overview: "Las vidas de dos sicarios de la mafia, un boxeador, un gánster y su esposa, y un par de bandidos de cafetería se entrelazan en cuatro historias de violencia y redención."
    },
    {
        id: 11,
        title: "Whiplash",
        posterPath: "https://image.tmdb.org/t/p/original/7fn624j5lj3xTme2SgiLCeuedmO.jpg",
        rating: 8.5,
        duration: 107,
        genres: ["Drama", "Música"],
        overview: "Un joven baterista prometedor se inscribe en un conservatorio de música despiadado donde sus sueños de grandeza son mentoreados por un instructor que no se detendrá ante nada para realizar el potencial de un estudiante."
    },
    {
        id: 12,
        title: "Matrix",
        posterPath: "https://image.tmdb.org/t/p/original/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
        rating: 8.7,
        duration: 136,
        genres: ["Ciencia Ficción", "Acción"],
        overview: "Cuando una bella desconocida lleva al hacker informático Neo a un inframundo prohibido, descubre la impactante verdad: la vida que conoce es el engaño elaborado de una malvada ciberinteligencia."
    },
    {
        id: 13,
        title: "Coco",
        posterPath: "https://image.tmdb.org/t/p/original/eKi8dIrr8voobbaGzDpe8w0PVbC.jpg",
        rating: 8.4,
        duration: 105,
        genres: ["Animación", "Familia", "Fantasía"],
        overview: "A pesar de la desconcertante prohibición de música de su familia durante generaciones, Miguel sueña con convertirse en un músico consumado como su ídolo, Ernesto de la Cruz."
    },
    {
        id: 14,
        title: "El Viaje de Chihiro",
        posterPath: "https://image.tmdb.org/t/p/original/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
        rating: 8.6,
        duration: 125,
        genres: ["Animación", "Fantasía", "Aventura"],
        overview: "Durante la mudanza de su familia a los suburbios, una niña de 10 años deambula por un mundo gobernado por dioses, brujas y espíritus, y donde los humanos se transforman en bestias."
    },
    {
        id: 15,
        title: "El Padrino",
        posterPath: "https://image.tmdb.org/t/p/original/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
        rating: 9.2,
        duration: 175,
        genres: ["Crimen", "Drama"],
        overview: "El patriarca envejecido de una dinastía del crimen organizado transfiere el control de su imperio clandestino a su hijo reacio."
    },
    {
        id: 16,
        title: "Dune",
        posterPath: "https://image.tmdb.org/t/p/original/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
        rating: 8.0,
        duration: 155,
        genres: ["Ciencia Ficción", "Aventura", "Drama"],
        overview: "Paul Atreides, un joven brillante y talentoso nacido con un gran destino más allá de su comprensión, debe viajar al planeta más peligroso del universo para asegurar el futuro de su familia y su gente."
    },
    {
        id: 17,
        title: "Oppenheimer",
        posterPath: "https://image.tmdb.org/t/p/original/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
        rating: 8.5,
        duration: 180,
        genres: ["Drama", "Historia", "Biografía"],
        overview: "La historia del científico estadounidense J. Robert Oppenheimer y su papel en el desarrollo de la bomba atómica."
    },
    {
        id: 18,
        title: "Déjame Salir",
        posterPath: "https://image.tmdb.org/t/p/original/tFXcEccSQMf3lfhfXKSU9iRBpa3.jpg",
        rating: 7.7,
        duration: 104,
        genres: ["Terror", "Suspense", "Misterio"],
        overview: "Un joven afroamericano visita a los padres de su novia blanca durante el fin de semana, donde su inquietud latente sobre su recepción eventualmente llega a un punto de ebullición."
    },
    {
        id: 19,
        title: "Barbie",
        posterPath: "https://image.tmdb.org/t/p/original/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",
        rating: 7.0,
        duration: 114,
        genres: ["Comedia", "Aventura", "Fantasía"],
        overview: "Barbie y Ken están viviendo el momento de sus vidas en el colorido y aparentemente perfecto mundo de Barbie Land. Sin embargo, cuando tienen la oportunidad de ir al mundo real, pronto descubren las alegrías y los peligros de vivir entre los humanos."
    },
    {
        id: 20,
        title: "Your Name",
        posterPath: "https://image.tmdb.org/t/p/original/q719jXXEzOoYaps6babgKnONONX.jpg",
        rating: 8.4,
        duration: 106,
        genres: ["Animación", "Romance", "Fantasía"],
        overview: "Los estudiantes de secundaria Mitsuha y Taki son completos desconocidos que viven vidas separadas. Pero una noche, de repente cambian de lugar."
    }
];
