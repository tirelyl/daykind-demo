import { Trans, useTranslation } from 'react-i18next'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { Button } from '../components/ui/button'
import { ProductCard } from '../components/product-card'
import { ErrorState, Loading } from '../components/states'
import { catalogOptions, categories, defaultSearch } from '../lib/catalog'

export const Route = createFileRoute('/')({ component: Home })
function Home() {
  const { t } = useTranslation()

  const featured = useQuery(catalogOptions(defaultSearch))
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="hero-intro">{t('Good things for everyday living')}</p>
          <h1>
            <Trans
              i18nKey="Make room <line/>for the <em>little <desktop/> things.</em>"
              components={{
                line: <br />,
                em: <em />,
                desktop: <br className="desktop-break" />,
              }}
            />
          </h1>
          <p className="hero-description">
            <Trans
              i18nKey="Thoughtful objects for your home, your rituals,<desktop/> and wherever the day takes you."
              components={{ desktop: <br className="desktop-break" /> }}
            />
          </p>
          <Button asChild size="lg">
            <Link to="/products" search={defaultSearch}>
              {t('Explore the collection')}
              <ArrowRight size={18} />
            </Link>
          </Button>
          <div className="hero-footnote">
            <span className="tiny-dot" />
            {t('Considered essentials. Everyday companions.')}
          </div>
        </div>
        <div className="hero-photo">
          <img
            src="/images/hero.jpg"
            alt={t(
              'A sunlit living room with natural textures, green plants and thoughtfully chosen objects',
            )}
            width={1800}
            height={1350}
            fetchPriority="high"
          />
          <div className="hero-caption">
            <span>{t('A slower kind of living.')}</span>
            <span>{t('01 / The everyday collection')}</span>
          </div>
        </div>
      </section>
      <section className="wrap section featured">
        <div className="section-heading">
          <div>
            <p className="section-kicker">{t('The everyday favorites')}</p>
            <h2>{t('Good company for your day.')}</h2>
          </div>
          <Link className="text-link" to="/products" search={defaultSearch}>
            {t('Shop all essentials')}
            <ArrowRight size={17} />
          </Link>
        </div>
        {featured.isPending ? (
          <Loading />
        ) : featured.isError ? (
          <ErrorState
            message={featured.error.message}
            retry={() => void featured.refetch()}
          />
        ) : (
          <div className="product-grid">
            {featured.data.products.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
      <section className="wrap section categories-section">
        <div className="section-heading">
          <div>
            <p className="section-kicker">{t('Find your everyday')}</p>
            <h2>{t('A place for everything.')}</h2>
          </div>
          <p>{t('From slow mornings to days on the move.')}</p>
        </div>
        <div className="category-grid">
          {categories.map((c, i) => (
            <Link
              key={c.id}
              className={`category-card category-${c.id}`}
              to="/products"
              search={{
                ...defaultSearch,
                category: c.id as 'home' | 'kitchen' | 'carry',
              }}
            >
              <div>
                <span className="category-number">0{i + 1}</span>
                <img
                  src={`/images/product-${[46, 53, 175][i]}.webp`}
                  alt=""
                  width={400}
                  height={300}
                  loading="lazy"
                />
              </div>
              <div className="category-label">
                <span>
                  <h3>{t(c.name)}</h3>
                  <p>{t(c.description)}</p>
                </span>
                <ArrowUpRight size={23} />
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="editorial">
        <div className="wrap editorial-inner">
          <span className="editorial-symbol" aria-hidden="true">
            d.
          </span>
          <div>
            <p className="section-kicker">{t('Less, but a little better')}</p>
            <h2>
              {t('Not more things.')}
              <br />
              {t('More meaning in the everyday.')}
            </h2>
            <p>
              {t('We choose objects with a purpose and a little personality.')}
              <br />
              {t('The ones that quietly become your favorites.')}
            </p>
            <Link className="text-link" to="/products" search={defaultSearch}>
              {t('Find your next favorite')}
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
