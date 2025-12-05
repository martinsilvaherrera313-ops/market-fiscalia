-- Schema para PostgreSQL (Render)
-- Compatible con MySQL local

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  departamento VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email ON usuarios(email);

-- Trigger para updated_at en PostgreSQL
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE
ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabla de publicaciones
CREATE TABLE IF NOT EXISTS publicaciones (
  id SERIAL PRIMARY KEY,
  usuario_id INT NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'vendido', 'inactivo')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_usuario ON publicaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_estado ON publicaciones(estado);
CREATE INDEX IF NOT EXISTS idx_created_at ON publicaciones(created_at);

CREATE TRIGGER update_publicaciones_updated_at BEFORE UPDATE
ON publicaciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabla de imágenes de publicaciones
CREATE TABLE IF NOT EXISTS imagenes (
  id SERIAL PRIMARY KEY,
  publicacion_id INT NOT NULL,
  url VARCHAR(500) NOT NULL,
  orden INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_publicacion ON imagenes(publicacion_id);
