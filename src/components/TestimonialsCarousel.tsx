import { ChevronLeft, ChevronRight, Quote, Star, StarHalf } from "lucide-react";
import { useMemo, useState } from "react";
import { testimonials } from "../data/testimonials";

const VISIBLE_TESTIMONIALS = 3;

const formatRating = (rating: number) => rating.toFixed(1).replace(".", ",");

const RatingStars = ({ rating }: { rating: number }) => (
  <div className="testimonial-stars" aria-label={`Avaliação ${formatRating(rating)} de 5`}>
    {Array.from({ length: 5 }, (_, index) => {
      const position = index + 1;
      const isFull = rating >= position;
      const isHalf = !isFull && rating >= position - 0.5;
      const Icon = isHalf ? StarHalf : Star;

      return (
        <Icon
          key={position}
          className={`h-4 w-4 ${isFull || isHalf ? "is-filled" : "is-empty"}`}
          aria-hidden="true"
        />
      );
    })}
  </div>
);

export const TestimonialsCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const visibleTestimonials = useMemo(
    () =>
      Array.from({ length: VISIBLE_TESTIMONIALS }, (_, offset) => {
        const index = (activeIndex + offset) % testimonials.length;
        return testimonials[index];
      }),
    [activeIndex],
  );

  const goToPrevious = () => {
    setActiveIndex((current) => (current === 0 ? testimonials.length - 1 : current - 1));
  };

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % testimonials.length);
  };

  return (
    <div className="testimonials-shell mx-auto max-w-7xl">
      <div className="testimonials-toolbar">
        <div>
          <p className="testimonials-kicker">Avaliações reais</p>
          <p className="testimonials-note">Testemunhos de clientes que acessaram o conteúdo.</p>
        </div>

        <div className="testimonials-controls" aria-label="Navegar avaliações">
          <button type="button" aria-label="Avaliações anteriores" onClick={goToPrevious}>
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button type="button" aria-label="Próximas avaliações" onClick={goToNext}>
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="testimonials-grid">
        {visibleTestimonials.map((testimonial) => (
          <article key={`${testimonial.name}-${testimonial.rating}`} className="testimonial-card">
            <Quote className="testimonial-quote-icon" aria-hidden="true" />
            <div className="testimonial-rating-row">
              <RatingStars rating={testimonial.rating} />
              <span>{formatRating(testimonial.rating)}</span>
            </div>
            <p className="testimonial-text">“{testimonial.text}”</p>
            <footer>
              <strong>{testimonial.name}</strong>
              <span>Cliente do Portal</span>
            </footer>
          </article>
        ))}
      </div>

      <div className="testimonials-status" aria-label="Posição das avaliações">
        <span>Mostrando a partir da avaliação {activeIndex + 1} de {testimonials.length}</span>
        <div aria-hidden="true">
          <i style={{ width: `${((activeIndex + 1) / testimonials.length) * 100}%` }} />
        </div>
      </div>
    </div>
  );
};
