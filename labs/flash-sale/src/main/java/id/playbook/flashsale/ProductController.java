package id.playbook.flashsale;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
class ProductController {
    private final ProductService products;

    ProductController(ProductService products) {
        this.products = products;
    }

    @GetMapping("/products/{id}")
    ResponseEntity<ProductService.Product> get(@PathVariable long id) {
        ProductService.Product product = products.find(id);
        return product == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(product);
    }
}
