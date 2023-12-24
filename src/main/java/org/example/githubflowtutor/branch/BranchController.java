package org.example.githubflowtutor.branch;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/branches")
public class BranchController {
    private final BranchService service;

    @Autowired
    public BranchController(BranchService service) {
        this.service = service;
    }

    @DeleteMapping
    public ResponseEntity<Void> initialize(@RequestBody Branch branch) {
        service.deleteAllBranches();
        service.insertBranch(branch);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<Branch>> getAllBranches() {
        List<Branch> branches = service.findAllBranches();
        return ResponseEntity.ok(branches);
    }

    @GetMapping("/count")
    public ResponseEntity<Integer> getBranchNumber(@RequestParam("local") String local) {
        return ResponseEntity.ok(service.foo(local));
    }

    @PostMapping("/push")
    public ResponseEntity<Long> postBranches(@RequestBody List<Branch> branches) {
        long mainLastTimestamp = service.saveOrInsertBranches(branches);
        return ResponseEntity.ok(mainLastTimestamp);
    }
}
