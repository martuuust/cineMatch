
import React, { useState } from 'react';
import { Star, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Movie } from '../types';
import Card from './ui/Card';

interface MovieCardProps {
  movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const [showFullOverview, setShowFullOverview] = useState(false);

  return (
    <Card noPadding className="h-full flex flex-col max-w-sm mx-auto border-slate-200 bg-white shadow-xl">
      <div className="relative aspect-[2/3] w-full group overflow-hidden">
        <img 
          src={movie.posterPath} 
          alt={movie.title} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-80" />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 shadow-lg border border-slate-100">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="font-bold text-sm text-slate-900">{movie.rating}</span>
        </div>
      </div>
      
      <div className="p-6 flex flex-col gap-3 relative z-10 -mt-12">
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-bold leading-tight text-slate-900 drop-shadow-sm">{movie.title}</h2>
          <span className="text-slate-600 font-medium bg-slate-100 px-2 py-1 rounded-md text-sm border border-slate-200">{movie.releaseYear}</span>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {movie.genres.map(genre => (
            <span key={genre} className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-lg text-xs font-semibold">
              {genre}
            </span>
          ))}
          <div className="flex items-center gap-1 ml-auto text-xs text-slate-400">
            <Clock className="w-3 h-3" />
            {movie.duration}
          </div>
        </div>

        <div className="mt-2">
          <p className={`text-sm text-slate-600 leading-relaxed transition-all ${showFullOverview ? '' : 'line-clamp-3'}`}>
            {movie.overview}
          </p>
          <button 
            onClick={() => setShowFullOverview(!showFullOverview)}
            className="flex items-center gap-1 mt-2 text-primary text-xs font-bold uppercase tracking-wider hover:text-primary/80 transition-colors"
          >
            {showFullOverview ? <><ChevronUp className="w-3 h-3" /> Less</> : <><ChevronDown className="w-3 h-3" /> More</>}
          </button>
        </div>
      </div>
    </Card>
  );
};

export default MovieCard;
