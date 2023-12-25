package org.example.githubflowtutor.branch;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BranchService {
    private final BranchRepository repository;

    @Autowired
    public BranchService(BranchRepository repository) {
        this.repository = repository;
    }

    public void deleteAllBranches() {
        repository.deleteAll();
    }

    public Integer foo(String local) {
        int count = 0;
        for (Branch b : repository.findAll()) {
            if (b.getName().startsWith(local)) {
                ++count;
            }
        }
        return count;
    }

    public void insertBranch(Branch branch) {
        repository.insert(branch);
    }

    public List<Branch> findAllBranches() {
        return repository.findAll();
    }

    public long saveOrInsertBranches(List<Branch> branches) {
        for (Branch b : branches) {
            Optional<Branch> branch = repository.findByName(b.getName());
            if (branch.isPresent()) {
                branch.get().setLastTimestamp(b.getLastTimestamp());
                branch.get().setDeleted(b.isDeleted());
                repository.save(branch.get());
            } else {
                repository.insert(b);
            }
        }
        return repository.findByName("main").get().getLastTimestamp();
    }
}
