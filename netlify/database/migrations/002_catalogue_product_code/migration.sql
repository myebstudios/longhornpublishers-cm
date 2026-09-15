ALTER TABLE catalogue_titles
  ADD COLUMN product_code text NOT NULL
  CONSTRAINT catalogue_titles_product_code_format
    CHECK (
      product_code = btrim(product_code)
      AND char_length(product_code) BETWEEN 1 AND 64
    );

CREATE UNIQUE INDEX catalogue_titles_product_code_ci_idx
  ON catalogue_titles (lower(product_code));
