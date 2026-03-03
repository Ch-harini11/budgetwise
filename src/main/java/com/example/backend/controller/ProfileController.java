package com.example.backend.controller;

import com.example.backend.model.Profile;
import com.example.backend.repository.ProfileRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/profile")
@CrossOrigin("*")
public class ProfileController {

    private final ProfileRepository repo;

    public ProfileController(ProfileRepository repo){
        this.repo = repo;
    }

    @PostMapping
    public Profile save(@RequestBody Profile p){
        return repo.save(p);
    }

    @GetMapping("/{userId}")
    public Profile get(@PathVariable String userId){
        return repo.findByUserId(userId);
    }
}
