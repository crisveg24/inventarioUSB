"use client"

import { useCallback } from 'react'
import { driver } from 'driver.js'

/**
 * Hook personalizado para manejar tours de la aplicación con Driver.js
 * Proporciona funciones para crear tours específicos para diferentes páginas
 */
export const useTour = () => {
  
  /**
   * Tour del Dashboard - Explica las métricas y visualizaciones principales
   */
  const startDashboardTour = useCallback(() => {
    const driverObj = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      steps: [
        {
          element: 'h1',
          popover: {
            title: '🏠 Dashboard de Inventarios',
            description: 'Bienvenido al panel principal de tu sistema de inventarios. Aquí puedes ver un resumen completo de todos tus productos y métricas importantes.',
            side: "bottom",
            align: 'start'
          }
        },
        {
          element: '[data-tour="stats-cards"]',
          popover: {
            title: '📊 Métricas Principales',
            description: 'Estas tarjetas muestran las estadísticas más importantes: total de items, valor del inventario, productos con stock bajo y productos agotados.',
            side: "bottom",
            align: 'center'
          }
        },
        {
          element: '[data-tour="inventory-chart"]',
          popover: {
            title: '📈 Gráfico de Inventario',
            description: 'Este gráfico muestra la evolución de las entradas y salidas de productos a lo largo del tiempo, ayudándote a identificar tendencias.',
            side: "left",
            align: 'center'
          }
        },
        {
          element: '[data-tour="category-chart"]',
          popover: {
            title: '🍰 Distribución por Categorías',
            description: 'Visualiza cómo se distribuyen tus productos por categorías para entender mejor tu inventario.',
            side: "right",
            align: 'center'
          }
        },
        {
          element: '[data-tour="top-items"]',
          popover: {
            title: '🏆 Productos Principales',
            description: 'Tabla con los productos más valiosos de tu inventario, ordenados por valor total.',
            side: "top",
            align: 'center'
          }
        }
      ]
    })
    
    driverObj.drive()
  }, [])

  /**
   * Tour de la Página de Inventario - Explica la tabla y funcionalidades
   */
  const startInventoryTour = useCallback(() => {
    const driverObj = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      steps: [
        {
          element: 'h1',
          popover: {
            title: '📦 Gestión de Inventario',
            description: 'Esta es la página principal para administrar todos tus productos. Aquí puedes ver, buscar, editar y administrar tu inventario completo.',
            side: "bottom",
            align: 'start'
          }
        },
        {
          element: '[data-tour="api-test"]',
          popover: {
            title: '🧪 Prueba de API',
            description: 'Este botón te permite probar la conectividad con la API externa para diagnosticar problemas de conexión.',
            side: "bottom",
            align: 'center'
          }
        },
        {
          element: '[data-tour="refresh-btn"]',
          popover: {
            title: '🔄 Refrescar Datos',
            description: 'Haz clic aquí para recargar los datos más recientes del inventario desde la base de datos.',
            side: "bottom",
            align: 'center'
          }
        },
        {
          element: '[data-tour="add-product"]',
          popover: {
            title: '➕ Agregar Producto',
            description: 'Utiliza este botón para añadir nuevos productos a tu inventario. Se abrirá un formulario con todos los campos necesarios.',
            side: "bottom",
            align: 'center'
          }
        },
        {
          element: '[data-tour="search-box"]',
          popover: {
            title: '🔍 Búsqueda Inteligente',
            description: 'Busca productos por nombre, categoría o proveedor. La búsqueda es en tiempo real y muy rápida.',
            side: "bottom",
            align: 'center'
          }
        },
        {
          element: '[data-tour="items-per-page"]',
          popover: {
            title: '📄 Items por Página',
            description: 'Controla cuántos productos mostrar en cada página. Útil para navegar grandes inventarios.',
            side: "left",
            align: 'center'
          }
        },
        {
          element: '[data-tour="inventory-table"]',
          popover: {
            title: '📋 Tabla de Productos',
            description: 'Esta tabla muestra todos tus productos con información detallada: ID, nombre, categoría, cantidad, precio, proveedor y estado.',
            side: "top",
            align: 'center'
          }
        },
        {
          element: '[data-tour="pagination"]',
          popover: {
            title: '⏭️ Navegación de Páginas',
            description: 'Navega entre diferentes páginas de productos cuando tengas muchos items en tu inventario.',
            side: "top",
            align: 'center'
          }
        }
      ]
    })
    
    driverObj.drive()
  }, [])

  /**
   * Tour del Formulario de Producto - Explica los campos del formulario
   */
  const startFormTour = useCallback(() => {
    const driverObj = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      steps: [
        {
          element: '[data-tour="product-form"]',
          popover: {
            title: '📝 Formulario de Producto',
            description: 'Este formulario te permite agregar nuevos productos o editar productos existentes en tu inventario.',
            side: "top",
            align: 'center'
          }
        },
        {
          element: '[data-tour="product-name"]',
          popover: {
            title: '🏷️ Nombre del Producto',
            description: 'Ingresa un nombre descriptivo para tu producto. Este será el identificador principal.',
            side: "bottom",
            align: 'center'
          }
        },
        {
          element: '[data-tour="product-category"]',
          popover: {
            title: '📂 Categoría',
            description: 'Selecciona la categoría que mejor describe tu producto. Esto ayuda con la organización y reportes.',
            side: "bottom",
            align: 'center'
          }
        },
        {
          element: '[data-tour="product-quantity"]',
          popover: {
            title: '📊 Cantidad',
            description: 'Cantidad actual disponible en inventario. Este número se usa para calcular el valor total.',
            side: "bottom",
            align: 'center'
          }
        },
        {
          element: '[data-tour="product-price"]',
          popover: {
            title: '💰 Precio',
            description: 'Precio unitario del producto. Se multiplica por la cantidad para obtener el valor total.',
            side: "bottom",
            align: 'center'
          }
        },
        {
          element: '[data-tour="product-supplier"]',
          popover: {
            title: '🏢 Proveedor',
            description: 'Nombre del proveedor o empresa que suministra este producto.',
            side: "bottom",
            align: 'center'
          }
        }
      ]
    })
    
    driverObj.drive()
  }, [])

  /**
   * Tour de la Página de Reportes
   */
  const startReportsTour = useCallback(() => {
    const driverObj = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      steps: [
        {
          element: 'h1',
          popover: {
            title: '📊 Centro de Reportes',
            description: 'Aquí puedes generar reportes detallados y análisis de tu inventario para tomar mejores decisiones.',
            side: "bottom",
            align: 'start'
          }
        },
        {
          element: '[data-tour="basic-reports"]',
          popover: {
            title: '📈 Reportes Básicos',
            description: 'Genera reportes estándar con las métricas más importantes de tu inventario.',
            side: "bottom",
            align: 'center'
          }
        },
        {
          element: '[data-tour="advanced-reports"]',
          popover: {
            title: '🔬 Reportes Avanzados',
            description: 'Crea reportes personalizados con filtros específicos y análisis detallados.',
            side: "bottom",
            align: 'center'
          }
        }
      ]
    })
    
    driverObj.drive()
  }, [])

  /**
   * Highlight simple para elementos específicos
   */
  const highlightElement = useCallback((elementSelector: string, title: string, description: string) => {
    const driverObj = driver()
    driverObj.highlight({
      element: elementSelector,
      popover: {
        title,
        description,
        side: "bottom",
        align: 'center'
      }
    })
  }, [])

  /**
   * Tour de bienvenida para nuevos usuarios
   */
  const startWelcomeTour = useCallback(() => {
    const driverObj = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      steps: [
        {
          popover: {
            title: '🎉 ¡Bienvenido al Sistema de Inventarios!',
            description: 'Te vamos a mostrar las principales funcionalidades de la aplicación. Este tour te ayudará a familiarizarte con todas las herramientas disponibles.'
          }
        },
        {
          element: '[data-tour="sidebar-dashboard"]',
          popover: {
            title: '🏠 Dashboard',
            description: 'Tu página principal con métricas y resumen del inventario.',
            side: "right",
            align: 'center'
          }
        },
        {
          element: '[data-tour="sidebar-inventory"]',
          popover: {
            title: '📦 Inventario',
            description: 'Gestiona todos tus productos: crear, editar, eliminar y buscar.',
            side: "right",
            align: 'center'
          }
        },
        {
          element: '[data-tour="sidebar-reports"]',
          popover: {
            title: '📊 Reportes',
            description: 'Genera reportes detallados y análisis de tu inventario.',
            side: "right",
            align: 'center'
          }
        },
        {
          element: '[data-tour="theme-toggle"]',
          popover: {
            title: '🌓 Cambiar Tema',
            description: 'Alterna entre tema claro y oscuro según tu preferencia.',
            side: "left",
            align: 'center'
          }
        }
      ]
    })
    
    driverObj.drive()
  }, [])

  return {
    startDashboardTour,
    startInventoryTour,
    startFormTour,
    startReportsTour,
    startWelcomeTour,
    highlightElement
  }
}

export default useTour